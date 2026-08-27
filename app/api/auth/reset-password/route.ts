import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { ClientUser } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, verification code, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Verify code
    const codeResult = await query(
      `SELECT id FROM public.auth_codes 
       WHERE email = $1 AND code = $2 AND type = 'reset_password' AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail, cleanCode]
    );

    if (codeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    const codeId = codeResult.rows[0].id;

    // Check user exists
    const userResult = await query<ClientUser>(
      'SELECT id, client_id, is_active FROM client_users WHERE email = $1 LIMIT 1',
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await query(
      'UPDATE client_users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
      [passwordHash, normalizedEmail]
    );

    // Mark code as used
    await query('UPDATE public.auth_codes SET used = true WHERE id = $1', [codeId]);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });

  } catch (error) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
