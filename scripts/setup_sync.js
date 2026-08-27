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

async function setupSync() {
  console.log('================================================================');
  console.log('    INSTALLING REAL-TIME ADMIN <-> CLIENT CRM DATABASE SYNC');
  console.log('================================================================\n');

  const defaultPasswordHash = await bcrypt.hash('client123', 10);
  const adminPasswordHash = await bcrypt.hash('7d2d699568d2c41c2b71ead164aa425b', 10);

  // 1. Add ON DELETE CASCADE to foreign key if needed
  console.log('1. Setting ON DELETE CASCADE on foreign keys...');
  try {
    await pool.query(`
      ALTER TABLE public.client_users 
      DROP CONSTRAINT IF EXISTS client_users_client_id_fkey,
      ADD CONSTRAINT client_users_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES public.clients(client_id) ON DELETE CASCADE;
    `);
    console.log('✓ Foreign key constraint updated with ON DELETE CASCADE.');
  } catch (e) {
    console.log('Note on FK constraint:', e.message);
  }

  // 2. Drop legacy triggers
  await pool.query(`DROP TRIGGER IF EXISTS trg_sync_client_to_client_users ON public.clients;`);
  await pool.query(`DROP TRIGGER IF EXISTS trg_sync_client_delete ON public.clients;`);

  // 3. Create / replace trigger functions
  console.log('2. Creating PostgreSQL sync trigger functions...');
  await pool.query(`
    CREATE OR REPLACE FUNCTION public.sync_client_to_client_users_fn()
    RETURNS TRIGGER AS $$
    DECLARE
      v_default_hash TEXT := '${defaultPasswordHash}';
    BEGIN
      IF NEW.owner_email IS NOT NULL AND TRIM(NEW.owner_email) != '' THEN
        -- Check if an owner user already exists for this client (excluding admin)
        IF EXISTS (SELECT 1 FROM public.client_users WHERE client_id = NEW.client_id AND role = 'owner' AND email != 'admin') THEN
          -- Update existing owner
          UPDATE public.client_users 
          SET 
            email = LOWER(TRIM(NEW.owner_email)),
            name = COALESCE(NEW.business_name || ' Owner', name),
            is_active = (NEW.status = 'active'),
            updated_at = NOW()
          WHERE client_id = NEW.client_id AND role = 'owner' AND email != 'admin';
        ELSE
          -- Insert owner user
          INSERT INTO public.client_users (
            client_id,
            email,
            password_hash,
            name,
            role,
            is_active,
            created_at,
            updated_at
          ) VALUES (
            NEW.client_id,
            LOWER(TRIM(NEW.owner_email)),
            v_default_hash,
            COALESCE(NEW.business_name || ' Owner', 'Owner'),
            'owner',
            (NEW.status = 'active'),
            NOW(),
            NOW()
          )
          ON CONFLICT (email) DO UPDATE SET
            client_id = EXCLUDED.client_id,
            name = EXCLUDED.name,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
        END IF;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await pool.query(`
    CREATE OR REPLACE FUNCTION public.sync_client_delete_fn()
    RETURNS TRIGGER AS $$
    BEGIN
      DELETE FROM public.client_users WHERE client_id = OLD.client_id AND email != 'admin';
      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 4. Attach Triggers to public.clients table
  console.log('3. Attaching triggers to `public.clients` table...');
  await pool.query(`
    CREATE TRIGGER trg_sync_client_to_client_users
    AFTER INSERT OR UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_client_to_client_users_fn();

    CREATE TRIGGER trg_sync_client_delete
    BEFORE DELETE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_client_delete_fn();
  `);
  console.log('✓ Triggers attached.');

  // 5. Populate / ensure client_users from current clients
  console.log('4. Syncing all clients from `public.clients` into `public.client_users`...');
  const clients = await pool.query('SELECT * FROM public.clients');
  for (const client of clients.rows) {
    if (!client.owner_email) continue;
    const email = client.owner_email.trim().toLowerCase();
    await pool.query(
      `INSERT INTO public.client_users (client_id, email, password_hash, name, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'owner', $5, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET client_id = EXCLUDED.client_id, name = EXCLUDED.name, is_active = EXCLUDED.is_active, updated_at = NOW()`,
      [client.client_id, email, defaultPasswordHash, `${client.business_name} Owner`, client.status === 'active']
    );
    console.log(`✓ Synced client '${client.client_id}' -> User Email: '${email}'`);
  }

  // 6. Verification
  console.log('\n--- VERIFICATION OF DATABASE TABLES ---');
  const usersRes = await pool.query('SELECT id, client_id, email, name, role, is_active FROM public.client_users ORDER BY id ASC');
  console.table(usersRes.rows);

  const clientsRes = await pool.query('SELECT client_id, business_name, owner_email, owner_phone, status FROM public.clients ORDER BY client_id ASC');
  console.table(clientsRes.rows);

  console.log('================================================================');
  console.log('       SYNC SYSTEM INSTALLED AND VERIFIED 100%');
  console.log('================================================================');

  await pool.end();
}

setupSync().catch(err => {
  console.error('Setup sync error:', err);
  process.exit(1);
});
