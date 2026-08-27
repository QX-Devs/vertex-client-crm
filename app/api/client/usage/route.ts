import { NextRequest, NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireClient(req);
    if (auth instanceof NextResponse) return auth;
    const clientId = auth.clientId;

    const planResult = await query(
      'SELECT * FROM plans WHERE plan_id = (SELECT plan_id FROM clients WHERE client_id = $1)',
      [clientId]
    );

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const currentUsageResult = await query(
      'SELECT * FROM usage_counters WHERE client_id = $1 AND month = $2',
      [clientId, currentMonth]
    );

    const historyResult = await query(
      'SELECT * FROM usage_counters WHERE client_id = $1 ORDER BY month DESC LIMIT 3',
      [clientId]
    );

    return NextResponse.json({
      plan: planResult.rows[0] || {},
      currentUsage: currentUsageResult.rows[0] || { used_chats: 0, monthly_limit: planResult.rows[0]?.monthly_chat_limit || 0 },
      monthlyHistory: historyResult.rows || []
    });
  } catch (error) {
    console.error('Usage GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
