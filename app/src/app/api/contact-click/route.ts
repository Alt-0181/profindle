import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CHANNELS = new Set(['line', 'phone', 'email', 'website']);

// Logs an anonymous contact-click. No buyer identity is captured — buyers browse
// without accounts, so this only records that *someone* tapped a contact channel
// on a provider's profile. Best-effort: it must never block or slow the buyer.
export async function POST(request: NextRequest) {
  try {
    const { companyId, channel } = await request.json();
    if (!companyId || !CHANNELS.has(channel)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
    await admin.from('contact_clicks').insert({ company_id: companyId, channel });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
