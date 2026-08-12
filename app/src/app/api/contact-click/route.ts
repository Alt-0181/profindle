import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isExcludedViewer } from '@/lib/analytics-exclude';

// 'reveal' = buyer tapped "View contact" (interest signal). The rest = which
// channel they then used.
const CHANNELS = new Set(['reveal', 'line', 'phone', 'email', 'website']);

// Logs an anonymous contact-click. No buyer identity is captured — buyers browse
// without accounts, so this only records that *someone* tapped a contact channel
// on a provider's profile. Best-effort: it must never block or slow the buyer.
export async function POST(request: NextRequest) {
  try {
    const { companyId, channel } = await request.json();
    if (!companyId || !CHANNELS.has(channel)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Don't count testing / super-admin / self activity.
    if (await isExcludedViewer(companyId)) return NextResponse.json({ ok: true, skipped: true });
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
