import { NextRequest, NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireClient(req);
    if (auth instanceof NextResponse) return auth;
    const clientId = auth.clientId;

    const result = await query(
      'SELECT id, platform, status, external_account_id, external_account_name, webhook_status, last_validated_at FROM channel_integrations WHERE client_id = $1 ORDER BY platform',
      [clientId]
    );

    return NextResponse.json({ channels: result.rows || [] });
  } catch (error) {
    console.error('Channels GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
