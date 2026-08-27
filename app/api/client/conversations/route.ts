import { NextRequest, NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireClient(req);
    if (auth instanceof NextResponse) return auth;
    const { clientId } = auth;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const channel = searchParams.get('channel') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const whereClauses: string[] = ['client_id = $1'];
    const values: any[] = [clientId];
    let paramIndex = 2;

    if (channel) {
      whereClauses.push(`channel = $${paramIndex}`);
      values.push(channel);
      paramIndex++;
    }

    if (search) {
      whereClauses.push(`(customer_id ILIKE $${paramIndex} OR from_phone ILIKE $${paramIndex} OR message_text ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereString = whereClauses.join(' AND ');

    const countQuery = `SELECT COUNT(*) as total FROM conversations WHERE ${whereString}`;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);

    const dataQuery = `
      SELECT * FROM conversations 
      WHERE ${whereString}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataResult = await query(dataQuery, [...values, limit, offset]);

    return NextResponse.json({
      conversations: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
