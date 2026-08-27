import { NextRequest, NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireClient(req);
    if (auth instanceof NextResponse) return auth;
    const clientId = auth.clientId;

    const settingsResult = await query('SELECT * FROM client_settings WHERE client_id = $1', [clientId]);
    const kbResult = await query('SELECT * FROM client_knowledge_base WHERE client_id = $1 ORDER BY section_key', [clientId]);

    return NextResponse.json({
      settings: settingsResult.rows[0] || {},
      knowledgeBase: kbResult.rows || []
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireClient(req);
    if (auth instanceof NextResponse) return auth;
    const clientId = auth.clientId;
    const body = await req.json();
    const { action } = body;

    if (action === 'update_settings') {
      const {
        service_description, pricing_rules, coverage_rules,
        booking_requirements, fallback_response, escalation_keyword,
        human_agent_phone, booking_required_fields
      } = body;
      
      const checkResult = await query('SELECT 1 FROM client_settings WHERE client_id = $1', [clientId]);
      
      if (checkResult.rows.length > 0) {
        await query(`
          UPDATE client_settings SET
            service_description = $1, pricing_rules = $2, coverage_rules = $3,
            booking_requirements = $4, fallback_response = $5, escalation_keyword = $6,
            human_agent_phone = $7, booking_required_fields = $8
          WHERE client_id = $9
        `, [
          service_description, pricing_rules, coverage_rules,
          booking_requirements, fallback_response, escalation_keyword,
          human_agent_phone, booking_required_fields, clientId
        ]);
      } else {
        await query(`
          INSERT INTO client_settings (
            client_id, service_description, pricing_rules, coverage_rules,
            booking_requirements, fallback_response, escalation_keyword,
            human_agent_phone, booking_required_fields
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          clientId, service_description, pricing_rules, coverage_rules,
          booking_requirements, fallback_response, escalation_keyword,
          human_agent_phone, booking_required_fields
        ]);
      }
      return NextResponse.json({ success: true });
    }
    
    if (action === 'add_kb_section') {
      const { section_key, content, enabled = true } = body;
      await query(`
        INSERT INTO client_knowledge_base (client_id, section_key, content, enabled)
        VALUES ($1, $2, $3, $4)
      `, [clientId, section_key, content, enabled]);
      return NextResponse.json({ success: true });
    }

    if (action === 'update_kb_section') {
      const { id, section_key, content, enabled } = body;
      await query(`
        UPDATE client_knowledge_base 
        SET section_key=$2, content=$3, enabled=$4, updated_at=NOW() 
        WHERE id=$1 AND client_id=$5
      `, [id, section_key, content, enabled, clientId]);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_kb_section') {
      const { id } = body;
      await query('DELETE FROM client_knowledge_base WHERE id=$1 AND client_id=$2', [id, clientId]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
