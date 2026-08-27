const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

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

async function runEmailAuthTest() {
  console.log('================================================================');
  console.log('  TESTING GMAIL SMTP & AUTH CODES (EMAIL LOGIN + RESET)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  }

  const client = await pool.connect();

  try {
    // 1. Verify SMTP Transporter Connection
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'aivertex.noreply@gmail.com',
        pass: process.env.SMTP_PASS || 'bdmfwweubyximevh',
      },
    });

    const verifySMTP = await transporter.verify();
    assert(verifySMTP === true, 'Gmail SMTP connection verified (aivertex.noreply@gmail.com)');

    // 2. Test Sending an actual verification email
    const testCode = '839201';
    const sendResult = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Vertex CRM" <aivertex.noreply@gmail.com>',
      to: 'aivertex.noreply@gmail.com', // Sending to self for live delivery verification
      subject: `[Test] ${testCode} is your Vertex CRM Login Code`,
      text: `Your Vertex verification code is: ${testCode}`,
      html: `<b>Your Vertex verification code is: ${testCode}</b>`,
    });

    assert(Boolean(sendResult.messageId), `Email successfully delivered (MessageId: ${sendResult.messageId})`);

    // 2.5 Ensure public.auth_codes table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.auth_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        type VARCHAR(32) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_auth_codes_lookup ON public.auth_codes(email, code, type, used);
      CREATE INDEX IF NOT EXISTS idx_auth_codes_expires ON public.auth_codes(expires_at);
    `);

    // 3. Test Database Auth Code Insertion & Expiry
    const testEmail = 'owner@cleanpro.jo';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Clean up old codes
    await client.query('DELETE FROM public.auth_codes WHERE email = $1', [testEmail]);

    // Insert test code
    await client.query(`
      INSERT INTO public.auth_codes (email, code, type, expires_at)
      VALUES ($1, $2, 'login_code', $3)
    `, [testEmail, testCode, expiresAt]);

    const codeLookup = await client.query(`
      SELECT * FROM public.auth_codes 
      WHERE email = $1 AND code = $2 AND type = 'login_code' AND used = false AND expires_at > NOW()
    `, [testEmail, testCode]);

    assert(codeLookup.rows.length === 1, 'Auth code stored and retrieved correctly');

    // 4. Test Code Verification & Invalidation
    await client.query('UPDATE public.auth_codes SET used = true WHERE id = $1', [codeLookup.rows[0].id]);

    const usedLookup = await client.query(`
      SELECT * FROM public.auth_codes 
      WHERE email = $1 AND code = $2 AND used = false
    `, [testEmail, testCode]);

    assert(usedLookup.rows.length === 0, 'Used auth code cannot be reused (one-time use security)');

    // 5. Test Password Reset Simulation
    const newPass = 'newClientPass2026!';
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPass, salt);

    await client.query('UPDATE public.client_users SET password_hash = $1 WHERE email = $2', [newHash, testEmail]);

    const updatedUser = await client.query('SELECT password_hash FROM public.client_users WHERE email = $1', [testEmail]);
    const passMatches = bcrypt.compareSync(newPass, updatedUser.rows[0].password_hash);
    assert(passMatches === true, 'Password reset update and hash verification');

    // Revert back to client123 for default demo access
    const defaultHash = bcrypt.hashSync('client123', salt);
    await client.query('UPDATE public.client_users SET password_hash = $1 WHERE email = $2', [defaultHash, testEmail]);

  } catch (err) {
    console.error('Test Error:', err);
    failed++;
  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n================================================================');
  console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runEmailAuthTest();
