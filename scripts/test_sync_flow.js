const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

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

async function runSyncTests() {
  console.log('================================================================');
  console.log('    TESTING REAL-TIME ADMIN <-> CLIENT CRM SYNCHRONIZATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Initial State Check
    const initialClient = await pool.query("SELECT * FROM public.clients WHERE client_id = 'cleanpro_jo'");
    const initialUser = await pool.query("SELECT * FROM public.client_users WHERE client_id = 'cleanpro_jo' AND role = 'owner' AND email != 'admin'");
    
    assert(initialClient.rows.length > 0, "Client 'cleanpro_jo' exists in public.clients");
    assert(initialUser.rows.length > 0, "Client User exists in public.client_users");
    assert(initialClient.rows[0].owner_email.toLowerCase() === initialUser.rows[0].email.toLowerCase(), `Initial email in clients ('${initialClient.rows[0].owner_email}') matches client_users ('${initialUser.rows[0].email}')`);

    // 2. Test Admin Portal Update (Update clients table)
    console.log('\n--- TEST 1: Admin updates client email in Admin CRM ---');
    const testEmail = 'updated-admin-test@cleanpro.jo';
    await pool.query(
      "UPDATE public.clients SET owner_email = $1, business_name = 'CleanPro Jordan (Updated)', updated_at = NOW() WHERE client_id = 'cleanpro_jo'",
      [testEmail]
    );

    const userAfterAdminUpdate = await pool.query(
      "SELECT * FROM public.client_users WHERE client_id = 'cleanpro_jo' AND role = 'owner' AND email != 'admin'"
    );

    assert(userAfterAdminUpdate.rows.length > 0, 'Client user row found after update');
    assert(userAfterAdminUpdate.rows[0].email === testEmail, `Client User email automatically synced to '${testEmail}'`);
    assert(userAfterAdminUpdate.rows[0].name === 'CleanPro Jordan (Updated) Owner', `Client User name automatically synced to 'CleanPro Jordan (Updated) Owner'`);

    // 3. Test Password Verification for updated email
    console.log('\n--- TEST 2: Password Login works with updated email ---');
    const isPwValid = await bcrypt.compare('client123', userAfterAdminUpdate.rows[0].password_hash);
    assert(isPwValid, "Password 'client123' verifies successfully for updated email");

    // 4. Test New Client Creation in Admin CRM
    console.log('\n--- TEST 3: Admin creates a new client in Admin CRM ---');
    const tempClientId = 'test_new_client_' + Date.now();
    const tempEmail = `owner@${tempClientId}.com`;
    
    await pool.query(`
      INSERT INTO public.clients (
        client_id, channel_account_id, business_name, channel, status,
        plan_id, owner_phone, owner_email, reply_tone, service_type,
        timezone, storage_destination, crm_webhook_url, language,
        created_at, updated_at
      ) VALUES ($1, 'ch_test', 'Test New Client Corp', 'whatsapp', 'active', 'starter', '+962799999999', $2, 'Friendly', 'Tech', 'UTC', 'postgres', '', 'en', NOW(), NOW())
    `, [tempClientId, tempEmail]);

    const newUserRes = await pool.query(
      "SELECT * FROM public.client_users WHERE client_id = $1",
      [tempClientId]
    );

    assert(newUserRes.rows.length > 0, `New client automatically generated client_user in Client CRM`);
    assert(newUserRes.rows[0].email === tempEmail, `New client_user has correct email '${tempEmail}'`);
    assert(newUserRes.rows[0].is_active === true, `New client_user is active`);

    // Clean up temp client
    await pool.query("DELETE FROM public.clients WHERE client_id = $1", [tempClientId]);
    const deletedUserCheck = await pool.query("SELECT * FROM public.client_users WHERE client_id = $1", [tempClientId]);
    assert(deletedUserCheck.rows.length === 0, `Deleting client automatically removed user from client_users`);

    // 5. Restore cleanpro_jo to mohammadkayyali15@gmail.com
    console.log('\n--- TEST 4: Restoring CleanPro Jordan email to mohammadkayyali15@gmail.com ---');
    await pool.query(
      "UPDATE public.clients SET owner_email = 'mohammadkayyali15@gmail.com', business_name = 'CleanPro Jordan', status = 'active', updated_at = NOW() WHERE client_id = 'cleanpro_jo'"
    );

    const finalUser = await pool.query(
      "SELECT * FROM public.client_users WHERE client_id = 'cleanpro_jo' AND role = 'owner' AND email != 'admin'"
    );

    assert(finalUser.rows[0].email === 'mohammadkayyali15@gmail.com', "CleanPro email successfully synced back to 'mohammadkayyali15@gmail.com'");

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`  SYNC TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

runSyncTests();
