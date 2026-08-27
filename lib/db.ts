import { Pool, PoolConfig, QueryResultRow } from 'pg';
import dns from 'dns';

// Force Node.js to resolve IPv4 addresses first (prevents Docker & Cloud ENETUNREACH with Supabase)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

const globalAny = globalThis as any;

export function getPool(): Pool {
  if (globalAny._clientPgPool) {
    return globalAny._clientPgPool;
  }

  // 1. Prefer discrete variables because passwords with special characters (% / + ?) won't break URL parser
  const host = process.env.POSTGRES_HOST || process.env.host;
  const user = process.env.POSTGRES_USER || process.env.user;
  const password = process.env.POSTGRES_PASSWORD || process.env.password;
  const database = process.env.POSTGRES_DB || process.env.database || 'postgres';
  const port = parseInt(process.env.POSTGRES_PORT || process.env.port || '6543', 10);

  if (host && user && password) {
    globalAny._clientPgPool = new Pool({
      host,
      port,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    return globalAny._clientPgPool;
  }

  // 2. Fallback to DATABASE_URL
  const connStr = process.env.DATABASE_URL;
  if (connStr) {
    globalAny._clientPgPool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    return globalAny._clientPgPool;
  }

  // Default fallback
  globalAny._clientPgPool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });
  return globalAny._clientPgPool;
}

export const pool: Pool = new Proxy({} as Pool, {
  get(target, prop, receiver) {
    const activePool = getPool();
    const value = Reflect.get(activePool, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(activePool);
    }
    return value;
  }
});

export async function query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
  const p = getPool();
  try {
    const result = await p.query<T>(sql, params);
    return { rows: result.rows, rowCount: result.rowCount ?? 0 };
  } catch (error) {
    console.error('Database query execution error:', error);
    throw error;
  }
}

export async function checkHealth(): Promise<{ connected: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    await query('SELECT 1');
    return { connected: true, latencyMs: Date.now() - start };
  } catch (error) {
    return { connected: false, latencyMs: Date.now() - start };
  }
}
