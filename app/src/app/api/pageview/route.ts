import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { isExcludedViewer } from '@/lib/analytics-exclude';

// First-party page-view logger. Records one row per navigation so we own an
// unlimited-history archive of site traffic (Vercel Analytics only keeps 30
// days). PDPA-friendly: we store a salted hash of IP+UA, never the raw IP, and
// only the referrer HOST (no query strings). Best-effort — never blocks the page.

const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|monitor|preview/i;

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
    if (BOT_RE.test(ua)) return NextResponse.json({ ok: true, skipped: 'bot' });

    // Never count the support/testing account or super-admins.
    if (await isExcludedViewer('')) return NextResponse.json({ ok: true, skipped: 'excluded' });

    const body = await request.json().catch(() => ({}));
    const rawPath = typeof body.path === 'string' ? body.path : '';
    if (!rawPath) return NextResponse.json({ ok: false }, { status: 400 });
    // Drop query string / fragment — keep just the pathname (no PII).
    const path = rawPath.split(/[?#]/)[0].slice(0, 300);

    const ip =
      (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const salt = process.env.VIEW_HASH_SALT ?? 'profindle-views';
    const visitorHash = createHash('sha256').update(`${salt}|${ip}|${ua}`).digest('hex').slice(0, 40);

    const country = request.headers.get('x-vercel-ip-country') || null;

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

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
