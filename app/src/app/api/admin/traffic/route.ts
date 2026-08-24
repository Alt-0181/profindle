import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { visitorHashFromHeaders } from '@/lib/visitor-hash';

// A visitor with this many page views in the 30-day window is almost certainly
// automated (crawler / uptime monitor / script), not a human browsing.
const AUTOMATED_THRESHOLD = 20;

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'super_admin') return null;
  return user;
}

function topCounts(items: (string | null | undefined)[], limit: number) {
  const map = new Map<string, number>();
  for (const raw of items) {
    const key = raw || '';
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([key, count]) => ({ key, count }));
}

async function loadExcluded(admin: ReturnType<typeof getAdmin>): Promise<Set<string>> {
  try {
    const { data } = await admin.from('analytics_excluded_visitors').select('visitor_hash');
    return new Set((data ?? []).map((r: { visitor_hash: string }) => r.visitor_hash));
  } catch {
    return new Set();
  }
}

// GET /api/admin/traffic — site-wide + per-company traffic summary (bots and
// admin-excluded devices filtered out).
export async function GET(request: NextRequest) {
  const caller = await requireSuperAdmin();
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = getAdmin();
  const now = Date.now();
  const start30 = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const t7 = now - 7 * 24 * 60 * 60 * 1000;
  const t1 = now - 24 * 60 * 60 * 1000;

  const excluded = await loadExcluded(admin);
  const callerHash = visitorHashFromHeaders(request.headers);
  const callerExcluded = excluded.has(callerHash);

  const { count: totalAllTime } = await admin
    .from('page_views')
    .select('id', { count: 'exact', head: true });

  const { data: rawRows } = await admin
    .from('page_views')
    .select('path, referrer_host, visitor_hash, country, created_at')
    .gte('created_at', start30.toISOString())
    .order('created_at', { ascending: false })
    .limit(50000);

  // Drop admin-excluded devices (e.g. the founder's own test visits).
  const rows = (rawRows ?? []).filter((r: any) => !excluded.has(r.visitor_hash));

  // Per-visitor totals, then flag visitors with an automated-looking page-view
  // count (crawler / scraper / monitor) and drop them from ALL human stats — so
  // the whole tab (countries, referrers, pages, chart) reflects real people.
  const perVisitor = new Map<string, number>();
  for (const row of rows as any[]) {
    perVisitor.set(row.visitor_hash, (perVisitor.get(row.visitor_hash) ?? 0) + 1);
  }
  const automated = new Set<string>();
  for (const [h, n] of perVisitor) if (n >= AUTOMATED_THRESHOLD) automated.add(h);
  const humanRows = (rows as any[]).filter(r => !automated.has(r.visitor_hash));

  const humanVisitors = new Set<string>();
  const thVisitors = new Set<string>();
  let views7 = 0;
  let views24 = 0;
  const dayMap = new Map<string, number>();

  for (const row of humanRows) {
    humanVisitors.add(row.visitor_hash);
    if (row.country === 'TH') thVisitors.add(row.visitor_hash);
    const ts = new Date(row.created_at).getTime();
    if (ts >= t7) views7++;
    if (ts >= t1) views24++;
    const day = new Date(row.created_at).toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }

  const uniqueVisitors = perVisitor.size;          // raw (incl. automated)
  const humanEstimate = humanVisitors.size;         // real people
  const suspectedAutomated = automated.size;

  const daily: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    daily.push({ date: d, count: dayMap.get(d) ?? 0 });
  }

  // Breakdowns from human rows only, so bots don't dominate the lists.
  const topPages = topCounts(humanRows.map((x: any) => x.path), 12);
  const topReferrers = topCounts(humanRows.map((x: any) => x.referrer_host), 10);
  const topCountries = topCounts(humanRows.map((x: any) => x.country), 8);
  const directCount = humanRows.filter((x: any) => !x.referrer_host).length;

  const { data: companyRows } = await admin
    .from('companies')
    .select('id, name, name_th, views, claimed, premium')
    .order('views', { ascending: false, nullsFirst: false })
    .limit(15);

  return NextResponse.json({
    site: {
      totalAllTime: totalAllTime ?? 0,
      views30: humanRows.length,
      unique30: uniqueVisitors,
      humanEstimate,
      suspectedAutomated,
      thVisitors: thVisitors.size,
      views7,
      views24,
      capped: (rawRows ?? []).length >= 50000,
    },
    callerExcluded,
    excludedDevices: excluded.size,
    daily,
    topPages,
    topReferrers,
    topCountries,
    directCount,
    topCompanies: (companyRows ?? []).map((c: any) => ({
      id: c.id,
      name: c.name || c.name_th || '—',
      views: c.views ?? 0,
      claimed: c.claimed,
      premium: c.premium,
    })),
  });
}

// POST /api/admin/traffic
//   { action: 'add' | 'remove' }  — exclude / re-include the caller's device
//   { action: 'reset' }           — wipe all page-view history (start fresh)
export async function POST(request: NextRequest) {
  const caller = await requireSuperAdmin();
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const admin = getAdmin();

  // Clear all recorded page views — counting starts fresh from now.
  if (body.action === 'reset') {
    const { error } = await admin.from('page_views').delete().gte('id', 0);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, reset: true });
  }

  const action = body.action === 'remove' ? 'remove' : 'add';
  const hash = visitorHashFromHeaders(request.headers);

  if (action === 'remove') {
    const { error } = await admin.from('analytics_excluded_visitors').delete().eq('visitor_hash', hash);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, callerExcluded: false });
  }

  const { error } = await admin
    .from('analytics_excluded_visitors')
    .upsert({ visitor_hash: hash, label: caller.email ?? 'admin device' }, { onConflict: 'visitor_hash' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, callerExcluded: true });
}
