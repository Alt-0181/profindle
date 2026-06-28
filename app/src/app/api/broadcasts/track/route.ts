import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { broadcastId, eventType } = await request.json();
    if (!broadcastId || !eventType) return NextResponse.json({ ok: false }, { status: 400 });

    await adminClient()
      .from('broadcast_events')
      .insert({ broadcast_id: broadcastId, event_type: eventType });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
