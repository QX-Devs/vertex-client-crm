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

async function inspectDetail() {
  console.log('--- ADMIN USERS ---');
  const adminUsers = await pool.query('SELECT * FROM public.admin_users');
  console.log(adminUsers.rows);

  console.log('\n--- CLIENT USERS ---');
  const clientUsers = await pool.query('SELECT id, client_id, email, name, role, is_active FROM public.client_users');
  console.log(clientUsers.rows);

  console.log('\n--- CLIENT SETTINGS ---');
  const cs = await pool.query('SELECT * FROM public.client_settings');
  console.log(cs.rows);

  console.log('\n--- CHANNEL INTEGRATIONS ---');
  const ci = await pool.query('SELECT * FROM public.channel_integrations');
  console.log(ci.rows);

  console.log('\n--- USAGE COUNTERS ---');
  const uc = await pool.query('SELECT * FROM public.usage_counters');
  console.log(uc.rows);

  console.log('\n--- CONVERSATIONS ---');
  const convs = await pool.query('SELECT count(*) FROM public.conversations');
  console.log('Conversations count:', convs.rows[0].count);

  console.log('\n--- LEADS / ORDERS ---');
  const leads = await pool.query('SELECT count(*) FROM public.leads_orders');
  console.log('Leads/Orders count:', leads.rows[0].count);

  await pool.end();
}

inspectDetail().catch(err => { console.error(err); process.exit(1); });
