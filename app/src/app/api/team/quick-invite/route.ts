import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { sendCollaboratorInvite } from '@/lib/team-invite';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// POST /api/team/quick-invite  { companyName?, email, canEditCompany, canEditPortfolio, lang? }
// Onboarding "invite a teammate to set this up": if the owner has no company
// yet, create a name-only draft they own, then invite the teammate to fill in
// the rest. Company creation/ownership stays with the owner — the teammate only
// edits (per the permissions granted here).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const email = String(body.email ?? '').trim().toLowerCase();
  const companyNameInput = String(body.companyName ?? '').trim();
  const canEditCompany = !!body.canEditCompany;
  const canEditPortfolio = !!body.canEditPortfolio;
  const lang = body.lang === 'en' ? 'en' : 'th';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (!canEditCompany && !canEditPortfolio) return NextResponse.json({ error: 'Pick at least one permission' }, { status: 400 });
  if (email === (user.email ?? '').toLowerCase()) return NextResponse.json({ error: 'That is your own email' }, { status: 400 });

  const admin = getAdmin();

  // Find the owner's company, or create a name-only draft they own.
  let { data: company } = await admin
    .from('companies').select('id, name, name_th').eq('user_id', user.id).maybeSingle();

  let companyCreated = false;
  if (!company) {
    if (!companyNameInput) return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    const { data: created, error: cErr } = await admin
      .from('companies')
      .insert({ name: companyNameInput, user_id: user.id })
      .select('id, name, name_th')
      .single();
    if (cErr || !created) return NextResponse.json({ error: cErr?.message ?? 'Could not create company' }, { status: 500 });
    company = created;
    companyCreated = true;
  }

  const result = await sendCollaboratorInvite(admin, {
    companyId: (company as any).id,
    companyName: ((company as any).name_th || (company as any).name) ?? '',
    email, canEditCompany, canEditPortfolio, lang,
    origin: new URL(request.url).origin,
    inviterId: user.id,
    inviterEmail: (user.email ?? '').toLowerCase(),
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  return NextResponse.json({ ok: true, companyCreated, emailSent: result.emailSent, emailError: result.emailError });
}
