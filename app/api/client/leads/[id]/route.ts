import { NextRequest, NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireClient(req);
    if (auth instanceof NextResponse) return auth;

    const result = await query(
      `SELECT * FROM leads_orders WHERE id = $1 AND client_id = $2`,
      [params.id, auth.clientId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireClient(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { lead_status, assigned_staff, notes, order_status } = body;

    // Verify ownership
    const checkResult = await query(
      `SELECT id FROM leads_orders WHERE id = $1 AND client_id = $2`,
      [params.id, auth.clientId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (lead_status !== undefined) {
      updates.push(`lead_status = $${paramIndex}`);
      values.push(lead_status);
      paramIndex++;
    }
    if (assigned_staff !== undefined) {
      updates.push(`assigned_staff = $${paramIndex}`);
      values.push(assigned_staff);
      paramIndex++;
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      values.push(notes);
      paramIndex++;
    }
    if (order_status !== undefined) {
      updates.push(`order_status = $${paramIndex}`);
      values.push(order_status);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(checkResult.rows[0]);
    }

    updates.push(`updated_at = NOW()`);
    values.push(params.id, auth.clientId);

    const updateResult = await query(
      `UPDATE leads_orders 
       SET ${updates.join(', ')} 
       WHERE id = $${paramIndex} AND client_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    return NextResponse.json(updateResult.rows[0]);

  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
