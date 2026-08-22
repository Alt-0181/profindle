import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isExcludedViewer } from '@/lib/analytics-exclude';
import { isBotUA, visitorHashFromHeaders } from '@/lib/visitor-hash';

// First-party page-view logger. Records one row per navigation so we own an
// unlimited-history archive of site traffic (Vercel Analytics only keeps 30
// days). PDPA-friendly: we store a salted hash of IP+UA, never the raw IP, and
// only the referrer HOST (no query strings). Best-effort — never blocks the page.

// Our own hostnames — self-referrals are stored as null (direct/internal).
const OWN_HOSTS = /(^|\.)profindle\.com$|vercel\.app$|localhost/i;

function referrerHost(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    const host = new URL(raw).hostname;
    if (!host || OWN_HOSTS.test(host)) return null; // internal navigation → direct
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get('user-agent') ?? '';
    if (isBotUA(ua)) return NextResponse.json({ ok: true, skipped: 'bot' });

    // Never count the support/testing account or super-admins.
    if (await isExcludedViewer('')) return NextResponse.json({ ok: true, skipped: 'excluded' });

    const body = await request.json().catch(() => ({}));
    const rawPath = typeof body.path === 'string' ? body.path : '';
    if (!rawPath) return NextResponse.json({ ok: false }, { status: 400 });
    // Drop query string / fragment — keep just the pathname (no PII).
    const path = rawPath.split(/[?#]/)[0].slice(0, 300);

    const visitorHash = visitorHashFromHeaders(request.headers);
    const country = request.headers.get('x-vercel-ip-country') || null;

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Skip visitors the admin has explicitly excluded (e.g. the founder's own
    // device/network). Resilient if the table hasn't been migrated yet.
    try {
      const { data: ex } = await admin
        .from('analytics_excluded_visitors')
        .select('visitor_hash')
        .eq('visitor_hash', visitorHash)
        .maybeSingle();
      if (ex) return NextResponse.json({ ok: true, skipped: 'self' });
    } catch { /* table missing → count normally */ }

    await admin.from('page_views').insert({
      path,
      referrer_host: referrerHost(body.referrer),
      country,
      visitor_hash: visitorHash,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
