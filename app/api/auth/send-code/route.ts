import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendLoginCodeEmail, sendPasswordResetEmail } from '@/lib/email';
import { ClientUser } from '@/lib/types';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, type } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!type || !['login_code', 'reset_password'].includes(type)) {
      return NextResponse.json({ error: 'Valid code type is required' }, { status: 400 });
    }

    // Verify user exists and is active
    let userResult = await query<ClientUser>(
      'SELECT id, client_id, email, name, is_active FROM client_users WHERE email = $1 AND is_active = true LIMIT 1',
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      // Check if client exists in clients table and auto-sync
      const clientCheck = await query(
        "SELECT client_id, business_name, owner_email, status FROM clients WHERE LOWER(TRIM(owner_email)) = $1 AND status = 'active' LIMIT 1",
        [normalizedEmail]
      );

      if (clientCheck.rows.length > 0) {
        const cl = clientCheck.rows[0];
        const defaultHash = '$2a$10$fV3cE4r7rR9Z4nN1a9Z4nOeJ9K1x2y3z4w5v6u7t8s9r0q1p2o3n.';
        const syncRes = await query<ClientUser>(`
          INSERT INTO public.client_users (client_id, email, password_hash, name, role, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, 'owner', true, NOW(), NOW())
          ON CONFLICT (email) DO UPDATE SET client_id = EXCLUDED.client_id, name = EXCLUDED.name, is_active = true, updated_at = NOW()
          RETURNING id, client_id, email, name, is_active
        `, [cl.client_id, normalizedEmail, defaultHash, `${cl.business_name} Owner`]);
        userResult = syncRes;
      }
    }

    if (userResult.rows.length === 0) {
      // Return 404 with friendly message
      return NextResponse.json({ error: 'No active account found with this email address' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Ensure migration table exists
    await query(`
      CREATE TABLE IF NOT EXISTS public.auth_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        type VARCHAR(32) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Invalidate previous unused codes for this email and type
    await query(
      'UPDATE public.auth_codes SET used = true WHERE email = $1 AND type = $2 AND used = false',
      [normalizedEmail, type]
    );

    // Generate secure 6-digit numeric code
    const codeNumber = crypto.randomInt(100000, 999999);
    const code = codeNumber.toString();

    // Set expiration 10 minutes in the future
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store code in database
    await query(
      'INSERT INTO public.auth_codes (email, code, type, expires_at) VALUES ($1, $2, $3, $4)',
      [normalizedEmail, code, type, expiresAt]
    );

    // Dispatch email
    let emailResult;
    if (type === 'login_code') {
      emailResult = await sendLoginCodeEmail(normalizedEmail, code, user.name);
    } else {
      emailResult = await sendPasswordResetEmail(normalizedEmail, code, user.name);
    }

    if (!emailResult.success) {
      console.error('Failed to dispatch email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again in a few moments.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
    });

  } catch (error) {
    console.error('Send Code API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
