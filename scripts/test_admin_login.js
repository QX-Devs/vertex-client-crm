const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db.jgjlmpequqqcnberangs.supabase.co',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'Lz/7WTs%PWhu?%+',
  database: process.env.POSTGRES_DB || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  ssl: { rejectUnauthorized: false }
});

async function testAdminLogin() {
  console.log('Testing Admin Login Credentials in Database...');

  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM public.client_users WHERE email = 'admin' AND is_active = true");
    if (res.rows.length === 0) {
      throw new Error('Admin user not found in database!');
    }

    const user = res.rows[0];
    console.log('Admin user found:', { id: user.id, email: user.email, name: user.name, role: user.role, client_id: user.client_id });

    const passwordMatch = await bcrypt.compare('7d2d699568d2c41c2b71ead164aa425b', user.password_hash);
    if (!passwordMatch) {
      throw new Error('Password hash does not match 7d2d699568d2c41c2b71ead164aa425b!');
    }

    console.log('✓ PASS: Admin password 7d2d699568d2c41c2b71ead164aa425b matches correctly with bcrypt hash.');
  } finally {
    client.release();
    await pool.end();
  }
}

testAdminLogin().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
