const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Parse .env
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch (e) {}

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db.jgjlmpequqqcnberangs.supabase.co',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'Lz/7WTs%PWhu?%+',
  database: process.env.POSTGRES_DB || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  ssl: { rejectUnauthorized: false }
});

async function inspect() {
  const tablesRes = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  
  console.log('--- DATABASE TABLES AND ROW COUNTS ---');
  for (const row of tablesRes.rows) {
    try {
      const countRes = await pool.query(`SELECT count(*) FROM public."${row.table_name}"`);
      console.log(`- ${row.table_name}: ${countRes.rows[0].count} rows`);
    } catch (e) {
      console.log(`- ${row.table_name}: Error reading (${e.message})`);
    }
  }

  console.log('\n--- USERS (Admin & Client Users) ---');
  try {
    const adminUsers = await pool.query(`SELECT * FROM public.users`);
    console.log('Admin Users (public.users):', adminUsers.rows);
  } catch (e) {
    console.log('public.users:', e.message);
  }

  try {
    const clientUsers = await pool.query(`SELECT id, client_id, email, name, role, is_active FROM public.client_users`);
    console.log('Client Users (public.client_users):', clientUsers.rows);
  } catch (e) {
    console.log('public.client_users:', e.message);
  }

  try {
    const clients = await pool.query(`SELECT client_id, business_name, plan_id, status FROM public.clients`);
    console.log('Clients (public.clients):', clients.rows);
  } catch (e) {
    console.log('public.clients:', e.message);
  }

  await pool.end();
}

inspect().catch(err => { console.error(err); process.exit(1); });
