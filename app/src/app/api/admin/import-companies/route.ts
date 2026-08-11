import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { SERVICES } from '@/lib/services';

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

// Canonical catalog service lookup (lowercased label -> canonical label).
const SERVICE_BY_LOWER = new Map(SERVICES.map((s) => [s.label.toLowerCase(), s.label]));

const normWebsite = (w: string) => w.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');

// POST /api/admin/import-companies  { companies: [...] }
// Inserts each as a seeded, unclaimed profile (claimed=false, source='seeded').
export async function POST(request: NextRequest) {
  const caller = await requireSuperAdmin();
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const input: any[] = Array.isArray(body?.companies) ? body.companies : [];
  if (input.length === 0) return NextResponse.json({ error: 'Provide a non-empty "companies" array' }, { status: 400 });
  if (input.length > 500) return NextResponse.json({ error: 'Max 500 companies per import' }, { status: 400 });

  const admin = getAdmin();

  // Existing names + websites, to skip duplicates (and avoid re-import dupes).
  const { data: existing } = await admin.from('companies').select('name, website');
  const seenNames = new Set((existing ?? []).map((c: any) => (c.name ?? '').trim().toLowerCase()).filter(Boolean));
  const seenSites = new Set((existing ?? []).map((c: any) => c.website ? normWebsite(c.website) : '').filter(Boolean));

  const rows: any[] = [];
  const invalid: string[] = [];
  const skipped: string[] = [];
  const unknownServices = new Set<string>();

  for (const c of input) {
    const name = typeof c?.name === 'string' ? c.name.trim() : '';
    if (!name) { invalid.push(JSON.stringify(c).slice(0, 80)); continue; }

    const nameKey = name.toLowerCase();
    const siteKey = c?.website ? normWebsite(String(c.website)) : '';
    if (seenNames.has(nameKey) || (siteKey && seenSites.has(siteKey))) { skipped.push(name); continue; }
    seenNames.add(nameKey);
    if (siteKey) seenSites.add(siteKey);

    // Map services to the canonical catalog; drop (and report) unknown ones.
    const services: string[] = [];
    for (const s of Array.isArray(c?.services) ? c.services : []) {
      const canon = SERVICE_BY_LOWER.get(String(s).trim().toLowerCase());
      if (canon) { if (!services.includes(canon)) services.push(canon); }
      else unknownServices.add(String(s));
    }

    rows.push({
      name,
      name_th: c?.name_th ?? null,
      description: c?.description ?? null,
      description_th: c?.description_th ?? null,
      province: c?.province ?? null,
      services,
      website: c?.website ?? null,
      phone: c?.phone ?? null,
      email: c?.email ?? null,
      line_id: c?.line_id ?? null,
      address: c?.address ?? null,          // Google Maps URL or a street address (shown as text)
      industry: c?.industry ?? null,
      founded_year: Number.isFinite(Number(c?.founded_year)) && c?.founded_year ? Number(c.founded_year) : null,
      team_size: c?.team_size ?? null,
      logo_initial: (c?.logo_initial ?? name.slice(0, 2)).toUpperCase(),
      claimed: false,
      source: 'seeded',
      verified: false,
      premium: false,
      buyer_only: false,
    });
  }

  let inserted = 0;
  if (rows.length > 0) {
    const { error, count } = await admin.from('companies').insert(rows, { count: 'exact' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    inserted = count ?? rows.length;
  }

  return NextResponse.json({
    inserted,
    skipped: skipped.length,
    invalid: invalid.length,
    skippedNames: skipped.slice(0, 50),
    unknownServices: Array.from(unknownServices).slice(0, 50),
  });
}
