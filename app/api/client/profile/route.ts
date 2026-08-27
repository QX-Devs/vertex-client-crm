import { NextRequest, NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireClient(req);
    if (auth instanceof NextResponse) return auth;
    const clientId = auth.clientId;

    const result = await query(
      'SELECT client_id, business_name, owner_phone, owner_email, timezone, language, reply_tone, service_type, status, plan_id, channel, created_at FROM clients WHERE client_id = $1',
      [clientId]
    );

    return NextResponse.json({ client: result.rows[0] || null });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireClient(req);
    if (auth instanceof NextResponse) return auth;
    const clientId = auth.clientId;
    const body = await req.json();

    const allowedFields = ['business_name', 'owner_phone', 'owner_email', 'timezone', 'language', 'reply_tone'];
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(body[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(clientId);

    const queryStr = `UPDATE clients SET ${updates.join(', ')} WHERE client_id = $${paramIndex} RETURNING client_id, business_name, owner_phone, owner_email, timezone, language, reply_tone, service_type, status, plan_id, channel, created_at`;

    const result = await query(queryStr, values);
    const updatedClient = result.rows[0];

    // Explicitly synchronize client_users login record
    if (body.owner_email || body.business_name) {
      const newEmail = (body.owner_email || updatedClient.owner_email || '').trim().toLowerCase();
      const newName = body.business_name ? `${body.business_name} Owner` : `${updatedClient.business_name} Owner`;

      if (newEmail) {
        await query(`
          UPDATE client_users 
          SET email = $1, name = $2, updated_at = NOW() 
          WHERE client_id = $3 AND role = 'owner' AND email != 'admin'
        `, [newEmail, newName, clientId]);
      }
    }

    return NextResponse.json({ success: true, client: updatedClient });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
