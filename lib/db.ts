import { Pool, PoolConfig, QueryResultRow } from 'pg';
import dns from 'dns';

// Force Node.js to resolve IPv4 addresses first (prevents Docker & Cloud ENETUNREACH with Supabase)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

const getPoolConfig = (): PoolConfig => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      lookup: (hostname: string, options: any, callback: any) => {
        const cb = typeof options === 'function' ? options : callback;
        dns.lookup(hostname, { family: 4 }, cb);
      }
    } as any;
  }

  const host = process.env.POSTGRES_HOST || process.env.host;
  const port = parseInt(process.env.POSTGRES_PORT || process.env.port || '5432', 10);
  const user = process.env.POSTGRES_USER || process.env.user;
  const password = process.env.POSTGRES_PASSWORD || process.env.password;
  const database = process.env.POSTGRES_DB || process.env.database;

  return {
    host,
    user,
    password,
    database,
    port,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    lookup: (hostname: string, options: any, callback: any) => {
      const cb = typeof options === 'function' ? options : callback;
      dns.lookup(hostname, { family: 4 }, cb);
    }
  } as any;
};

const globalAny = globalThis as any;

if (!globalAny._clientPgPool) {
  globalAny._clientPgPool = new Pool(getPoolConfig());
}

export const pool: Pool = globalAny._clientPgPool;

export async function query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
  const client = await pool.connect();
  try {
    const result = await client.query<T>(sql, params);
    return { rows: result.rows, rowCount: result.rowCount ?? 0 };
  } finally {
    client.release();
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
