import { NextRequest, NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await requireClient(req);
  if (auth instanceof NextResponse) return auth;

  const { clientId } = auth;
  const currentMonth = new Date().toISOString().slice(0, 7);

  try {
    const [
      conversationsRes,
      leadsRes,
      ordersRes,
      usageRes,
      activityRes,
      pendingLeadsRes
    ] = await Promise.all([
      query(
        `SELECT COUNT(*) as count FROM conversations WHERE client_id = $1 AND current_month = $2`,
        [clientId, currentMonth]
      ),
      query(
        `SELECT COUNT(*) as count FROM leads_orders WHERE client_id = $1 AND lead_status IS NOT NULL AND created_at >= date_trunc('month', NOW())`,
        [clientId]
      ),
      query(
        `SELECT COUNT(*) as count FROM leads_orders WHERE client_id = $1 AND order_confirmed = true AND created_at >= date_trunc('month', NOW())`,
        [clientId]
      ),
      query(
        `SELECT used_chats, monthly_limit FROM usage_counters WHERE client_id = $1 AND month = $2`,
        [clientId, currentMonth]
      ),
      query(
        `SELECT id, customer_id, from_phone, channel, message_text, direction, created_at FROM conversations WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [clientId]
      ),
      query(
        `SELECT COUNT(*) as count FROM leads_orders WHERE client_id = $1 AND lead_status IN ('new', 'contacted')`,
        [clientId]
      )
    ]);

    const stats = {
      conversationsCount: parseInt(conversationsRes.rows[0]?.count || '0', 10),
      leadsCount: parseInt(leadsRes.rows[0]?.count || '0', 10),
      ordersCount: parseInt(ordersRes.rows[0]?.count || '0', 10),
      usage: usageRes.rows[0] || { used_chats: 0, monthly_limit: 0 },
      recentActivity: activityRes.rows || [],
      pendingLeadsCount: parseInt(pendingLeadsRes.rows[0]?.count || '0', 10)
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
