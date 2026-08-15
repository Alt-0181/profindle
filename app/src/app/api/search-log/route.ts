import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isExcludedViewer } from '@/lib/analytics-exclude';

// Logs a buyer search for demand analytics. Anonymous — records only what was
// searched and how many results it returned (0 = unmet demand). Best-effort;
// never blocks. Support/super-admin searches are excluded so test queries don't
// pollute the demand signal.
export async function POST(request: NextRequest) {
  try {
    const { q, where, province, resultCount, lang } = await request.json();

    // Nothing to log if there was no actual query.
    const query = typeof q === 'string' ? q.trim() : '';
    const whereInfo = typeof where === 'string' ? where.trim() : '';
    if (!query && !whereInfo) return NextResponse.json({ ok: true, skipped: true });

    // Don't count the support/super-admin account's own test searches.
    if (await isExcludedViewer('')) return NextResponse.json({ ok: true, skipped: true });

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
    await admin.from('search_logs').insert({
      q: query || null,
      where_info: whereInfo || null,
      province: typeof province === 'string' && province ? province : null,
      result_count: Number.isFinite(Number(resultCount)) ? Number(resultCount) : 0,
      lang: typeof lang === 'string' ? lang : null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
