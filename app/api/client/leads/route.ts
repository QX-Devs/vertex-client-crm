import { NextRequest, NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireClient(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const channel = searchParams.get('channel');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    let whereClause = `client_id = $1 AND lead_status IS NOT NULL`;
    const params: any[] = [auth.clientId];
    let paramIndex = 2;

    if (status && status !== 'All') {
      whereClause += ` AND lead_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (channel && channel !== 'All') {
      whereClause += ` AND channel = $${paramIndex}`;
      params.push(channel);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (customer_id ILIKE $${paramIndex} OR from_phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM leads_orders WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const leadsResult = await query(
      `SELECT * FROM leads_orders 
       WHERE ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      leads: leadsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
