import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
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

// POST /api/admin/scrub-contacts   body: { apply?: boolean }
// One-time (re-runnable) hygiene pass: strips personal contact from UNCLAIMED
// profiles, applying the same rule as the importer. Claimed profiles are never
// touched — their owner entered that contact themselves.
// Dry-run by default; pass { apply: true } to persist the changes.
export async function POST(request: NextRequest) {
  const caller = await requireSuperAdmin();
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let apply = false;
  try { apply = Boolean((await request.json())?.apply); } catch { /* dry-run */ }

  const admin = getAdmin();
  const { data: rows, error } = await admin
    .from('companies')
    .select('id, name, phone, email, line_id')
    .eq('claimed', false);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let phoneCleared = 0, emailCleared = 0, lineCleared = 0;
  const affected: string[] = [];
  const updates: { id: string; phone: string | null; email: string | null; line_id: string | null }[] = [];

  for (const c of rows ?? []) {
    const clean = sanitizeSeededContact({ phone: c.phone, email: c.email, line_id: c.line_id });
    const dropPhone = c.phone && !clean.phone;
    const dropEmail = c.email && !clean.email;
    const dropLine = c.line_id && !clean.line_id;
    if (!dropPhone && !dropEmail && !dropLine) continue;
    if (dropPhone) phoneCleared++;
    if (dropEmail) emailCleared++;
    if (dropLine) lineCleared++;
    if (affected.length < 30) affected.push(c.name ?? c.id);
    updates.push({ id: c.id, phone: clean.phone, email: clean.email, line_id: clean.line_id });
  }

  if (apply && updates.length > 0) {
    const now = new Date().toISOString();
    // Update per row (Supabase has no bulk conditional update here).
    for (const u of updates) {
      await admin
        .from('companies')
        .update({ phone: u.phone, email: u.email, line_id: u.line_id, last_checked_at: now })
        .eq('id', u.id);
    }
  }

  return NextResponse.json({
    applied: apply,
    scanned: rows?.length ?? 0,
    companiesAffected: updates.length,
    phoneCleared,
    emailCleared,
    lineCleared,
    sample: affected,
  });
}
