import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { isExcludedViewer } from '@/lib/analytics-exclude';

// Records a profile view, deduped per viewer per day. We hash the IP + UA with a
// salt and store only the hash — never the raw IP. The DB trigger increments
// companies.views only when a genuinely new (company, viewer, day) row inserts,
// so refreshing the page does not inflate the count. Best-effort; never blocks.
export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();
    if (!companyId) return NextResponse.json({ ok: false }, { status: 400 });

    // Don't count testing / super-admin / self-views.
    if (await isExcludedViewer(companyId)) return NextResponse.json({ ok: true, skipped: true });

    const ip =
      (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const ua = request.headers.get('user-agent') ?? '';
    const salt = process.env.VIEW_HASH_SALT ?? 'profindle-views';
    const viewerHash = createHash('sha256').update(`${salt}|${ip}|${ua}`).digest('hex').slice(0, 40);

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // INSERT ... ON CONFLICT DO NOTHING — a same-day repeat by this viewer is a
    // no-op, so the trigger (and the view count) only fires once per day.
    await admin
      .from('profile_views')
      .upsert(
        { company_id: companyId, viewer_hash: viewerHash },
        { onConflict: 'company_id,viewer_hash,viewed_on', ignoreDuplicates: true }
      );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
