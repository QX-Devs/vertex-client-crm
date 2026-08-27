import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signClientToken, setAuthCookie } from '@/lib/auth';
import { ClientUser, Client, TokenPayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Verify code
    const codeResult = await query(
      `SELECT id FROM public.auth_codes 
       WHERE email = $1 AND code = $2 AND type = 'login_code' AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail, cleanCode]
    );

    if (codeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    const codeId = codeResult.rows[0].id;

    // Mark code as used
    await query('UPDATE public.auth_codes SET used = true WHERE id = $1', [codeId]);

    // Find active user
    const usersResult = await query<ClientUser>(
      'SELECT * FROM client_users WHERE email = $1 AND is_active = true LIMIT 1',
      [normalizedEmail]
    );

    if (usersResult.rows.length === 0) {
      return NextResponse.json({ error: 'User account not found or inactive' }, { status: 404 });
    }

    const user = usersResult.rows[0];

    // Find active client
    const clientsResult = await query<Client>(
      'SELECT * FROM clients WHERE client_id = $1 LIMIT 1',
      [user.client_id]
    );

    if (clientsResult.rows.length === 0 || clientsResult.rows[0].status !== 'active') {
      return NextResponse.json({ error: 'Client account is inactive' }, { status: 403 });
    }

    const client = clientsResult.rows[0];

    // Update last login
    await query('UPDATE client_users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Generate JWT Token
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.client_id,
    };

    const token = await signClientToken(payload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.client_id,
        businessName: client.business_name,
      },
    });

    setAuthCookie(response, token);
    return response;

  } catch (error) {
    console.error('Verify Code Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
