import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';

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
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

// GET /api/admin/traffic — site-wide + per-company traffic summary.
export async function GET() {
  const caller = await requireSuperAdmin();
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = getAdmin();
  const now = Date.now();
  const start30 = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const t7 = now - 7 * 24 * 60 * 60 * 1000;
  const t1 = now - 24 * 60 * 60 * 1000;

  // All-time total (cheap head count).
  const { count: totalAllTime } = await admin
    .from('page_views')
    .select('id', { count: 'exact', head: true });

  // Last 30 days of rows, aggregated in-process.
  const { data: rows } = await admin
    .from('page_views')
    .select('path, referrer_host, visitor_hash, country, created_at')
    .gte('created_at', start30.toISOString())
    .order('created_at', { ascending: false })
    .limit(50000);

  const r = rows ?? [];
  const uniq = new Set<string>();
  let views7 = 0;
  let views24 = 0;
  const dayMap = new Map<string, number>();

  for (const row of r as any[]) {
    uniq.add(row.visitor_hash);
    const ts = new Date(row.created_at).getTime();
    if (ts >= t7) views7++;
    if (ts >= t1) views24++;
    const day = new Date(row.created_at).toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }

  // Build a continuous 30-day daily series (fill gaps with 0).
  const daily: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    daily.push({ date: d, count: dayMap.get(d) ?? 0 });
  }

  const topPages = topCounts(r.map((x: any) => x.path), 12);
  const topReferrers = topCounts(r.map((x: any) => x.referrer_host), 10);
  const topCountries = topCounts(r.map((x: any) => x.country), 8);
  const directCount = r.filter((x: any) => !x.referrer_host).length;

  // Per-company visits (already tracked via profile_views → companies.views).
  const { data: companyRows } = await admin
    .from('companies')
    .select('id, name, name_th, views, claimed, premium')
    .order('views', { ascending: false, nullsFirst: false })
    .limit(15);

  return NextResponse.json({
    site: {
      totalAllTime: totalAllTime ?? 0,
      views30: r.length,
      unique30: uniq.size,
      views7,
      views24,
      capped: r.length >= 50000,
    },
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
