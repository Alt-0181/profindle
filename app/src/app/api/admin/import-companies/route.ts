import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { SERVICES } from '@/lib/services';
import { sanitizeSeededContact } from '@/lib/contact-classify';

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

  // Existing names + websites + DBD numbers, to skip duplicates (and avoid
  // re-import dupes). DBD number is the strongest dedup signal when present.
  const { data: existing } = await admin.from('companies').select('name, website, dbd_no');
  const seenNames = new Set((existing ?? []).map((c: any) => (c.name ?? '').trim().toLowerCase()).filter(Boolean));
  const seenSites = new Set((existing ?? []).map((c: any) => c.website ? normWebsite(c.website) : '').filter(Boolean));
  const seenDbd = new Set((existing ?? []).map((c: any) => (c.dbd_no ?? '').replace(/\D/g, '')).filter(Boolean));

  const rows: any[] = [];
  const invalid: string[] = [];
  const skipped: string[] = [];
  const unknownServices = new Set<string>();
  let personalContactDropped = 0; // count of personal channels stripped on import

  for (const c of input) {
    const name = typeof c?.name === 'string' ? c.name.trim() : '';
    if (!name) { invalid.push(JSON.stringify(c).slice(0, 80)); continue; }

    const nameKey = name.toLowerCase();
    const siteKey = c?.website ? normWebsite(String(c.website)) : '';
    const dbdKey = c?.dbd_no ? String(c.dbd_no).replace(/\D/g, '') : '';
    const dbdValid = /^\d{13}$/.test(dbdKey) ? dbdKey : '';
    if (seenNames.has(nameKey) || (siteKey && seenSites.has(siteKey)) || (dbdValid && seenDbd.has(dbdValid))) { skipped.push(name); continue; }
    seenNames.add(nameKey);
    if (siteKey) seenSites.add(siteKey);
    if (dbdValid) seenDbd.add(dbdValid);

    // Map services to the canonical catalog; drop (and report) unknown ones.
    const services: string[] = [];
    for (const s of Array.isArray(c?.services) ? c.services : []) {
      const canon = SERVICE_BY_LOWER.get(String(s).trim().toLowerCase());
      if (canon) { if (!services.includes(canon)) services.push(canon); }
      else unknownServices.add(String(s));
    }

    // PDPA data-minimization: on a seeded/unclaimed profile keep only
    // organizational contact channels; drop personal mobile / named email /
    // personal LINE entirely. The owner adds their own contact when they claim.
    const contact = sanitizeSeededContact({ phone: c?.phone, email: c?.email, line_id: c?.line_id });
    if (c?.phone && !contact.phone) personalContactDropped++;
    if (c?.email && !contact.email) personalContactDropped++;
    if (c?.line_id && !contact.line_id) personalContactDropped++;

    rows.push({
      name,
      name_th: c?.name_th ?? null,
      description: c?.description ?? null,
      description_th: c?.description_th ?? null,
      province: c?.province ?? null,
      services,
      website: c?.website ?? null,
      phone: contact.phone,
      email: contact.email,
      line_id: contact.line_id,
      address: c?.address ?? null,          // Google Maps URL or a street address (shown as text)
      industry: c?.industry ?? null,
      founded_year: Number.isFinite(Number(c?.founded_year)) && c?.founded_year ? Number(c.founded_year) : null,
      team_size: c?.team_size ?? null,
      logo_initial: (c?.logo_initial ?? name.slice(0, 2)).toUpperCase(),
      dbd_no: dbdValid || null,             // 13-digit DBD juristic-person number (verified upstream)
      claimed: false,
      source: 'seeded',
      source_url: c?.source_url ?? null,    // provenance: where this listing was found
      listing_status: 'active',
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
    personalContactDropped,
    skippedNames: skipped.slice(0, 50),
    unknownServices: Array.from(unknownServices).slice(0, 50),
  });
}
