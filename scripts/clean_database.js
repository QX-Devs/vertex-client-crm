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

async function cleanDatabase() {
  console.log('================================================================');
  console.log('       PURGING DATABASE ROWS (PRESERVING USERS & PASSWORDS)');
  console.log('================================================================\n');

  const tablesToPurge = [
    'conversations',
    'leads_orders',
    'auth_codes',
    'audit_logs',
    'admin_notifications',
    'idempotency_keys',
    'client_knowledge_base',
    'channel_integrations',
    'client_settings',
    'usage_counters'
  ];

  for (const table of tablesToPurge) {
    try {
      const delRes = await pool.query(`DELETE FROM public."${table}"`);
      console.log(`✓ Purged table "${table}": deleted ${delRes.rowCount} rows.`);
    } catch (err) {
      console.error(`✗ Error purging table "${table}":`, err.message);
    }
  }

  console.log('\n--- VERIFYING PRESERVED ACCOUNTS ---');

  const adminUsers = await pool.query(`SELECT id, email, name, role FROM public.admin_users`);
  console.log(`✓ Admin Users (${adminUsers.rowCount} preserved):`, adminUsers.rows);

  const clientUsers = await pool.query(`SELECT id, client_id, email, name, role, is_active FROM public.client_users`);
  console.log(`✓ Client CRM Users (${clientUsers.rowCount} preserved):`, clientUsers.rows);

  const clients = await pool.query(`SELECT client_id, business_name, plan_id, status FROM public.clients`);
  console.log(`✓ Clients (${clients.rowCount} preserved):`, clients.rows);

  const plans = await pool.query(`SELECT plan_id, name, monthly_chat_limit FROM public.plans`);
  console.log(`✓ Plans (${plans.rowCount} preserved):`, plans.rows);

  console.log('\n--- VERIFYING FINAL ROW COUNTS ---');
  const allTables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  for (const row of allTables.rows) {
    const c = await pool.query(`SELECT count(*) FROM public."${row.table_name}"`);
    console.log(`  - ${row.table_name}: ${c.rows[0].count} rows`);
  }

  console.log('\n================================================================');
  console.log('       DATABASE CLEANUP COMPLETED SUCCESSFULLY');
  console.log('================================================================\n');

  await pool.end();
}

cleanDatabase().catch(err => {
  console.error('Fatal cleanup error:', err);
  process.exit(1);
});
