const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Parse .env manually
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
} catch (e) {
  console.warn('No .env file found or unreadable');
}

const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db.jgjlmpequqqcnberangs.supabase.co',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'Lz/7WTs%PWhu?%+',
  database: process.env.POSTGRES_DB || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    // 1. Create client_users table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.client_users (
        id SERIAL PRIMARY KEY,
        client_id VARCHAR(100) NOT NULL REFERENCES public.clients(client_id),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'owner',
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_client_users_client_id ON public.client_users(client_id);
      CREATE INDEX IF NOT EXISTS idx_client_users_email ON public.client_users(email);
    `);
    console.log('client_users table verified/created successfully.');

    // 2. Ensure initial plans and clients exist
    await client.query(`
      INSERT INTO public.plans (plan_id, name, monthly_chat_limit, allowed_channels, allowed_message_types, enabled_modules, lead_fields, ai_level, memory_level, order_capture, human_handoff, storage_level, crm_enabled, is_active)
      VALUES 
        ('growth', 'Growth Tier', 3000, '["whatsapp","messenger","instagram"]'::jsonb, '["text","image","audio","location"]'::jsonb, '["ai","leads","orders"]'::jsonb, '["name","phone","service","area"]'::jsonb, 'Standard', 'Window', true, true, 'postgres', true, true),
        ('starter', 'Starter Tier', 1000, '["whatsapp"]'::jsonb, '["text"]'::jsonb, '["ai","leads"]'::jsonb, '["name","phone"]'::jsonb, 'Basic', 'Window', false, false, 'postgres', false, true),
        ('enterprise', 'Enterprise Tier', 25000, '["whatsapp","messenger","instagram"]'::jsonb, '["text","image","audio","video","document","location"]'::jsonb, '["ai","leads","orders","custom_webhook"]'::jsonb, '["name","phone","service","area","notes"]'::jsonb, 'Advanced', 'Vector', true, true, 'postgres', true, true)
      ON CONFLICT (plan_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO public.clients (client_id, channel_account_id, business_name, channel, status, plan_id, owner_phone, owner_email, reply_tone, service_type, timezone, language)
      VALUES 
        ('cleanpro_jo', '1098800089990621', 'CleanPro Jordan', 'whatsapp', 'active', 'growth', '+962 7 9123 4567', 'owner@cleanpro.jo', 'Jordanian Arabic, Warm, Professional', 'sofa_cleaning', 'Asia/Amman', 'ar-JO'),
        ('client_zest', '1098800089990623', 'Zest Gourmet Bistro', 'whatsapp', 'active', 'starter', '+962 7 9345 6789', 'info@zestgourmet.com', 'Friendly, Casual', 'restaurant', 'Asia/Amman', 'ar-JO')
      ON CONFLICT (client_id) DO NOTHING;
    `);

    // Ensure client_settings exist
    await client.query(`
      INSERT INTO public.client_settings (client_id, service_description, pricing_rules, coverage_rules, fallback_response, escalation_keyword, human_agent_phone, booking_required_fields)
      VALUES 
        ('cleanpro_jo', 'خدمات تنظيف الكنب والسجاد بالبخار بأحدث المعدات الألمانية', 'طقم 7 مقاعد = 23 دينار، كل مقعد إضافي 2 دينار', 'عمان وضواحيها، التوصيل مجاني داخل عمان', 'بتأكد مع الفريق وبنرجعلك بأقرب وقت', 'تحدث مع موظف', '+962791234567', '["name","phone","area","seats_count","date_time"]'::jsonb)
      ON CONFLICT (client_id) DO NOTHING;
    `);

    // Ensure sample channel_integrations exist
    await client.query(`
      INSERT INTO public.channel_integrations (client_id, platform, status, external_account_id, external_account_name, webhook_status)
      VALUES 
        ('cleanpro_jo', 'whatsapp', 'connected', '1098800089990621', 'CleanPro WhatsApp Business', 'active'),
        ('cleanpro_jo', 'instagram', 'connected', 'cleanpro_jo_ig', '@cleanpro_jo', 'active'),
        ('cleanpro_jo', 'messenger', 'connected', 'cleanpro_facebook_page', 'CleanPro Jordan FB', 'active')
      ON CONFLICT DO NOTHING;
    `);

    // Ensure usage counter exists
    const currentMonth = new Date().toISOString().slice(0, 7);
    await client.query(`
      INSERT INTO public.usage_counters (client_id, month, used_chats, monthly_limit)
      VALUES 
        ('cleanpro_jo', $1, 142, 3000)
      ON CONFLICT (client_id, month) DO UPDATE SET used_chats = 142;
    `, [currentMonth]);

    // Ensure sample leads exist
    await client.query(`
      INSERT INTO public.leads_orders (client_id, business_name, customer_id, from_phone, channel, lead_status, order_confirmed, order_status, order_payload, assigned_staff, notes)
      VALUES 
        ('cleanpro_jo', 'CleanPro Jordan', '962799887766', '+962 7 9988 7766', 'whatsapp', 'qualified', true, 'confirmed', '{"service":"تنظيف كنب 7 مقاعد","area":"عبدون","date_time":"2026-08-30 14:00","price":"23 JOD"}', 'أحمد خليل', 'تم الاتصال بالعميل وتأكيد الموعد يوم الأحد'),
        ('cleanpro_jo', 'CleanPro Jordan', '962788776655', '+962 7 8877 6655', 'instagram', 'new', false, 'pending', '{"service":"تنظيف سجاد","area":"دابوق"}', NULL, 'استفسار أولي من انستغرام'),
        ('cleanpro_jo', 'CleanPro Jordan', '962777665544', '+962 7 7766 5544', 'whatsapp', 'contacted', false, 'pending', '{"service":"تنظيف كنب 10 مقاعد","area":"الجبيهة"}', 'سامي', 'يحتاج إعادة اتصال لتحديد الموعد')
      ON CONFLICT DO NOTHING;
    `);

    // Ensure sample conversations exist
    await client.query(`
      INSERT INTO public.conversations (client_id, business_name, customer_id, from_phone, channel, message_id, message_type, message_text, public_customer_reply, direction, current_month)
      VALUES 
        ('cleanpro_jo', 'CleanPro Jordan', '962799887766', '+962 7 9988 7766', 'whatsapp', 'msg_101', 'text', 'مرحبا، بدي احجز موعد تنظيف كنب', 'أهلاً وسهلاً بك في CleanPro! يسعدنا خدمتك، ممكن اسمك الكريم والمنطقة؟', 'inbound', $1),
        ('cleanpro_jo', 'CleanPro Jordan', '962788776655', '+962 7 8877 6655', 'instagram', 'msg_102', 'text', 'كم سعر تنظيف طقم 7 مقاعد؟', 'عرضنا الحالي لطقم 7 مقاعد 23 دينار شامل التوصيل داخل عمان.', 'inbound', $1)
      ON CONFLICT DO NOTHING;
    `, [currentMonth]);

    // 3. Fetch existing clients
    const clients = await client.query('SELECT client_id, business_name, owner_email FROM public.clients');
    console.log('Clients in database:', clients.rows.map(c => `${c.client_id} (${c.business_name})`));

    // 4. Create client user logins
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('client123', salt);

    for (const c of clients.rows) {
      // Primary owner email from client table or fallback
      const emails = [
        c.owner_email || `${c.client_id}@vertex-crm.com`,
        `${c.client_id}@cleanpro.jo`
      ];

      for (const email of emails) {
        if (!email) continue;
        await client.query(`
          INSERT INTO public.client_users (client_id, email, password_hash, name, role)
          VALUES ($1, $2, $3, $4, 'owner')
          ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = true
        `, [c.client_id, email.toLowerCase(), hash, `${c.business_name} Owner`]);
        console.log(`✓ Login Ready -> Email: ${email.toLowerCase()} | Password: client123 (Client: ${c.client_id})`);
      }
    }

    // 5. Create / Update Admin User Credential
    const adminSalt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('7d2d699568d2c41c2b71ead164aa425b', adminSalt);
    const primaryClientId = clients.rows[0]?.client_id || 'cleanpro_jo';

    await client.query(`
      INSERT INTO public.client_users (client_id, email, password_hash, name, role, is_active)
      VALUES ($1, 'admin', $2, 'System Administrator', 'owner', true)
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        is_active = true,
        client_id = EXCLUDED.client_id;
    `, [primaryClientId, adminHash]);

    console.log(`✓ Login Ready -> Username: admin | Password: 7d2d699568d2c41c2b71ead164aa425b (Client: ${primaryClientId})`);

    console.log('\n========================================');
    console.log('  CLIENT CRM DATABASE SEED COMPLETE');
    console.log('========================================');
  } catch (err) {
    console.error('Migration & Seed Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
