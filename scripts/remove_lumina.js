const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db.jgjlmpequqqcnberangs.supabase.co',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'Lz/7WTs%PWhu?%+',
  database: process.env.POSTGRES_DB || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  ssl: { rejectUnauthorized: false }
});

async function purgeLumina() {
  console.log('================================================================');
  console.log('  PURGING LUMINA CLINIC FROM DATABASE & CODEBASE');
  console.log('================================================================\n');

  const client = await pool.connect();
  try {
    // 1. Delete from database tables in foreign key order
    console.log('Deleting Lumina records from database...');

    const tables = [
      'auth_codes',
      'conversations',
      'leads_orders',
      'client_settings',
      'client_knowledge_base',
      'channel_integrations',
      'usage_counters',
      'client_users',
      'clients'
    ];

    for (const table of tables) {
      try {
        let res;
        if (table === 'auth_codes') {
          res = await client.query("DELETE FROM public.auth_codes WHERE email LIKE '%lumina%'");
        } else if (table === 'client_users') {
          res = await client.query("DELETE FROM public.client_users WHERE client_id = 'client_lumina' OR email LIKE '%lumina%'");
        } else {
          res = await client.query(`DELETE FROM public.${table} WHERE client_id = 'client_lumina'`);
        }
        console.log(`✓ Purged from public.${table}: ${res.rowCount} row(s) deleted.`);
      } catch (err) {
        console.warn(`Table public.${table} skip/note: ${err.message}`);
      }
    }

    // Double check clients table for any business_name with Lumina
    const finalClientDel = await client.query("DELETE FROM public.clients WHERE business_name ILIKE '%lumina%' OR client_id ILIKE '%lumina%'");
    console.log(`✓ Purged any remaining Lumina matching clients: ${finalClientDel.rowCount} row(s) deleted.`);

    // Verify database is completely clean
    const verifyClients = await client.query("SELECT client_id, business_name FROM public.clients");
    console.log('\nRemaining Clients in Database:', verifyClients.rows);

    const verifyUsers = await client.query("SELECT id, email, client_id FROM public.client_users");
    console.log('Remaining Users in Database:', verifyUsers.rows);

  } catch (err) {
    console.error('Error during purge:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }

  // 2. Clean up scripts files in vertex-client-crm
  console.log('\nCleaning up local scripts and source files...');

  const filesToClean = [
    path.join(__dirname, 'seed_client_user.js'),
    path.join(__dirname, 'test_client_crm.js'),
  ];

  for (const file of filesToClean) {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      if (content.includes('lumina') || content.includes('Lumina')) {
        // Remove lines or replace client_lumina with client_zest
        content = content.replace(/\s*\('client_lumina'[\s\S]*?'dental_clinic'[\s\S]*?\),?/g, '');
        content = content.replace(/'client_lumina'/g, "'client_zest'");
        content = content.replace(/Lumina Dental & Aesthetic Clinic/g, "Zest Gourmet Bistro");
        content = content.replace(/contact@lumina-clinic\.com/g, "info@zestgourmet.com");
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✓ Cleaned Lumina references from: ${path.basename(file)}`);
      }
    }
  }

  console.log('\n================================================================');
  console.log('  LUMINA CLINIC FULLY PURGED FROM PROJECT & DATABASE');
  console.log('================================================================\n');
}

purgeLumina().catch(err => {
  console.error('Purge Failed:', err);
  process.exit(1);
});
