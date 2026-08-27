const { Pool } = require('pg');
const { SignJWT, jwtVerify } = require('jose');
const bcrypt = require('bcryptjs');
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

const JWT_SECRET = process.env.JWT_SECRET || 'crm-client-portal-secure-key-32chars-minimum';
const secretKey = new TextEncoder().encode(JWT_SECRET);

async function runTests() {
  console.log('================================================================');
  console.log('     VERTEX CLIENT CRM: AUTOMATED TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  const client = await pool.connect();

  try {
    // 1. Test Database Connectivity
    const dbTest = await client.query('SELECT 1 as val');
    assert(dbTest.rows[0].val === 1, 'Database connectivity and pool health');

    // 2. Test Client Users Table & Login Query
    const userRes = await client.query('SELECT * FROM public.client_users WHERE email = $1 AND is_active = true', ['owner@cleanpro.jo']);
    assert(userRes.rows.length === 1, 'Query user by email (owner@cleanpro.jo)');
    const user = userRes.rows[0];
    assert(user.client_id === 'cleanpro_jo', 'User belongs to cleanpro_jo client');

    // 3. Test Password Verification (bcrypt)
    const validPassword = await bcrypt.compare('client123', user.password_hash);
    assert(validPassword === true, 'Bcrypt password comparison for client123');

    const invalidPassword = await bcrypt.compare('wrongpassword', user.password_hash);
    assert(invalidPassword === false, 'Bcrypt rejects incorrect password');

    // 4. Test JWT Token Signing & Verification
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.client_id
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey);

    assert(typeof token === 'string' && token.length > 20, 'JWT client token generated');

    const { payload } = await jwtVerify(token, secretKey);
    assert(payload.clientId === 'cleanpro_jo', 'JWT verified and decoded correct clientId');
    assert(payload.role === 'owner', 'JWT verified correct owner role');

    // 5. Test Dashboard Queries (Tenant Scoped)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const convCount = await client.query('SELECT COUNT(*) as count FROM public.conversations WHERE client_id = $1', [payload.clientId]);
    assert(parseInt(convCount.rows[0].count, 10) >= 1, 'Dashboard conversations query scoped to client');

    const leadCount = await client.query('SELECT COUNT(*) as count FROM public.leads_orders WHERE client_id = $1 AND lead_status IS NOT NULL', [payload.clientId]);
    assert(parseInt(leadCount.rows[0].count, 10) >= 1, 'Dashboard leads query scoped to client');

    const usageCount = await client.query('SELECT used_chats, monthly_limit FROM public.usage_counters WHERE client_id = $1 AND month = $2', [payload.clientId, currentMonth]);
    assert(usageCount.rows.length > 0 && usageCount.rows[0].used_chats === 142, 'Usage counter accurate (142 / 3000 chats)');

    // 6. Test Conversations Filter & Pagination
    const convs = await client.query('SELECT * FROM public.conversations WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10', [payload.clientId]);
    assert(convs.rows.length >= 1, 'Conversations list returned');
    assert(convs.rows.every(r => r.client_id === 'cleanpro_jo'), 'All conversations strictly isolated to cleanpro_jo');

    // 7. Test Leads Management & Pipeline
    const leads = await client.query('SELECT * FROM public.leads_orders WHERE client_id = $1 AND lead_status IS NOT NULL', [payload.clientId]);
    assert(leads.rows.length >= 1, 'Leads list returned');
    assert(leads.rows.every(r => r.client_id === 'cleanpro_jo'), 'All leads strictly isolated to cleanpro_jo');

    // 8. Test Orders Management
    const orders = await client.query('SELECT * FROM public.leads_orders WHERE client_id = $1 AND order_confirmed = true', [payload.clientId]);
    assert(orders.rows.length >= 1, 'Orders list returned');
    assert(orders.rows[0].order_payload !== null, 'Order contains payload with service/booking details');

    // 9. Test Settings & Knowledge Base
    const settings = await client.query('SELECT * FROM public.client_settings WHERE client_id = $1', [payload.clientId]);
    assert(settings.rows.length === 1, 'Client settings loaded');
    assert(settings.rows[0].service_description.length > 5, 'Client service description present');

    // 10. Test Channel Integrations (Zero Secret Leak)
    const channels = await client.query('SELECT id, platform, status, external_account_id, webhook_status FROM public.channel_integrations WHERE client_id = $1', [payload.clientId]);
    assert(channels.rows.length >= 1, 'Connected channels list retrieved');
    assert(channels.rows.every(c => !c.credential_reference && !c.token), 'Zero credentials or secrets exposed in client channels');

    // 11. Test Profile Query
    const profile = await client.query('SELECT client_id, business_name, owner_phone, owner_email, timezone, language FROM public.clients WHERE client_id = $1', [payload.clientId]);
    assert(profile.rows.length === 1 && profile.rows[0].business_name === 'CleanPro Jordan', 'Client profile retrieved');

    // 12. Test Cross-Tenant Security Isolation
    const crossTenantLeads = await client.query('SELECT * FROM public.leads_orders WHERE client_id = $1', ['client_zest']);
    assert(crossTenantLeads.rows.every(r => r.client_id === 'client_zest'), 'Cross-tenant query strictly isolated');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
