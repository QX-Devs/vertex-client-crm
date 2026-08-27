const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function checkSync() {
  await pool.query("DELETE FROM public.clients WHERE client_id LIKE 'test_new_client_%'");

  const clientsRes = await pool.query(`SELECT client_id, business_name, owner_email, owner_phone, status FROM public.clients ORDER BY client_id`);
  console.log('--- CLIENTS (public.clients) ---');
  console.table(clientsRes.rows);

  const usersRes = await pool.query(`SELECT id, client_id, email, name, role, is_active FROM public.client_users ORDER BY id`);
  console.log('--- CLIENT USERS (public.client_users) ---');
  console.table(usersRes.rows);

  await pool.end();
}

checkSync().catch(err => { console.error(err); process.exit(1); });
