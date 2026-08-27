import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signClientToken, setAuthCookie } from '@/lib/auth';
import { ClientUser, Client, TokenPayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find active user
    let usersResult = await query<ClientUser>(
      'SELECT * FROM client_users WHERE email = $1 AND is_active = true LIMIT 1',
      [email.toLowerCase()]
    );

    if (usersResult.rows.length === 0) {
      // Check if client exists in clients table and auto-sync
      const clientCheck = await query(
        "SELECT client_id, business_name, owner_email, status FROM clients WHERE LOWER(TRIM(owner_email)) = $1 AND status = 'active' LIMIT 1",
        [email.toLowerCase()]
      );

      if (clientCheck.rows.length > 0) {
        const cl = clientCheck.rows[0];
        const defaultHash = await bcrypt.hash('client123', 10);
        const syncRes = await query<ClientUser>(`
          INSERT INTO public.client_users (client_id, email, password_hash, name, role, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, 'owner', true, NOW(), NOW())
          ON CONFLICT (email) DO UPDATE SET client_id = EXCLUDED.client_id, name = EXCLUDED.name, is_active = true, updated_at = NOW()
          RETURNING *
        `, [cl.client_id, email.toLowerCase(), defaultHash, `${cl.business_name} Owner`]);
        usersResult = syncRes;
      }
    }

    if (usersResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = usersResult.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Get client info and verify it's active
    const clientsResult = await query<Client>(
      'SELECT * FROM clients WHERE client_id = $1 LIMIT 1',
      [user.client_id]
    );

    if (clientsResult.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const client = clientsResult.rows[0];

    if (client.status !== 'active') {
      return NextResponse.json({ error: 'Client account is inactive' }, { status: 403 });
    }

    // Update last login
    await query(
      'UPDATE client_users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Create token payload
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.client_id
    };

    const token = await signClientToken(payload);
    
    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.client_id,
        businessName: client.business_name
      }
    });

    // Set cookie
    setAuthCookie(response, token);

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Internal server error',
      code: error?.code,
      name: error?.name,
      detail: error?.stack?.split('\n').slice(0, 3).join(' | ')
    }, { status: 500 });
  }
}
