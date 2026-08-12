import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { isExcludedViewer } from '@/lib/analytics-exclude';

// Records a portfolio-project view (a buyer opened a project's detail), deduped
// per viewer per day per project. We hash IP + UA with a salt and store only the
// hash — never the raw IP. The DB trigger bumps portfolio_projects.views only on
// a genuinely new (project, viewer, day) row, so reopening a project doesn't
// inflate the count. Best-effort; never blocks the buyer.
export async function POST(request: NextRequest) {
  try {
    const { projectId, companyId } = await request.json();
    if (!projectId) return NextResponse.json({ ok: false }, { status: 400 });

    // Don't count testing / super-admin / self-views (owner previewing own work).
    if (await isExcludedViewer(companyId ?? '')) return NextResponse.json({ ok: true, skipped: true });

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

    // INSERT ... ON CONFLICT DO NOTHING — a same-day repeat is a no-op, so the
    // trigger (and the view count) only fires once per viewer per day.
    await admin
      .from('portfolio_views')
      .upsert(
        { project_id: projectId, company_id: companyId ?? null, viewer_hash: viewerHash },
        { onConflict: 'project_id,viewer_hash,viewed_on', ignoreDuplicates: true }
      );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
