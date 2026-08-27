import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyClientToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { ClientUser, Client } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyClientToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get fresh user data
    const usersResult = await query<ClientUser>(
      'SELECT id, client_id, email, name, role, is_active FROM client_users WHERE id = $1 LIMIT 1',
      [payload.userId]
    );

    if (usersResult.rows.length === 0 || !usersResult.rows[0].is_active) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }

    const user = usersResult.rows[0];

    // Get fresh client data
    const clientsResult = await query<Client>(
      'SELECT client_id, business_name, status, plan_id, service_type FROM clients WHERE client_id = $1 LIMIT 1',
      [user.client_id]
    );

    if (clientsResult.rows.length === 0 || clientsResult.rows[0].status !== 'active') {
      return NextResponse.json({ error: 'Client account is inactive' }, { status: 403 });
    }

    const client = clientsResult.rows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      client: {
        client_id: client.client_id,
        business_name: client.business_name,
        status: client.status,
        plan_id: client.plan_id,
        service_type: client.service_type
      }
    });

  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
