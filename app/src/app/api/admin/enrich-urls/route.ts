import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enrichCompanyFromUrl } from '@/lib/enrich-company';
import { SERVICES } from '@/lib/services';

export const maxDuration = 60;

const INDUSTRY_BY_SERVICE = new Map(SERVICES.map((s) => [s.label, s.industry]));

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'super_admin') return null;
  return user;
}

// POST /api/admin/enrich-urls  { urls: string[] }
// Fetches + AI-enriches each URL (server-side) and returns import-ready company
// objects for review — it does NOT insert. Paste the result into the importer.
export async function POST(request: NextRequest) {
  const caller = await requireSuperAdmin();
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const urls: string[] = Array.isArray(body?.urls)
    ? body.urls.map((u: any) => String(u).trim()).filter(Boolean)
    : [];
  if (urls.length === 0) return NextResponse.json({ error: 'Provide a non-empty "urls" array' }, { status: 400 });
  if (urls.length > 12) return NextResponse.json({ error: 'Max 12 URLs per batch (fetching is slow — split into batches)' }, { status: 400 });

  const companies: any[] = [];
  const errors: { url: string; error: string }[] = [];

  // Simple concurrency pool (4 at a time) to stay within the function timeout.
  const CONCURRENCY = 4;
  let idx = 0;
  async function worker() {
    while (idx < urls.length) {
      const i = idx++;
      const url = urls[i];
      const res = await enrichCompanyFromUrl(url, apiKey!);
      if (!res.ok) { errors.push({ url, error: res.error }); continue; }
      const d = res.data;
      let host = url;
      try { host = new URL(/^https?:\/\//i.test(url) ? url : 'https://' + url).hostname.replace(/^www\./, ''); } catch { /* keep url */ }
      const industry = d.services.length ? (INDUSTRY_BY_SERVICE.get(d.services[0]) ?? null) : null;
      companies.push({
        name: d.nameEn || host,
        name_th: d.nameTh || null,
        website: /^https?:\/\//i.test(url) ? url : 'https://' + url,
        province: d.province || null,
        phone: d.phone || null,
        email: d.emailPublic || null,
        line_id: null,
        services: d.services,
        industry,
        description: d.descEn || null,
        description_th: d.descTh || null,
        address: d.address || null,      // street text (shows as text address); add a Maps link manually if wanted
        founded_year: d.foundedYear ? Number(d.foundedYear) : null,
        team_size: d.teamSize || null,
      });
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));

  return NextResponse.json({ companies, errors, enriched: companies.length, failed: errors.length });
}
