import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// POST /api/team/invite  { email, canEditCompany, canEditPortfolio, lang? }
// Only a company OWNER may invite. Creates a pending membership and emails a
// sign-up / accept link.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const email = String(body.email ?? '').trim().toLowerCase();
  const canEditCompany = !!body.canEditCompany;
  const canEditPortfolio = !!body.canEditPortfolio;
  const lang = body.lang === 'en' ? 'en' : 'th';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (!canEditCompany && !canEditPortfolio) return NextResponse.json({ error: 'Pick at least one permission' }, { status: 400 });
  if (email === (user.email ?? '').toLowerCase()) return NextResponse.json({ error: 'That is your own email' }, { status: 400 });

  const admin = getAdmin();

  // Caller must OWN a company.
  const { data: company } = await admin
    .from('companies').select('id, name').eq('user_id', user.id).maybeSingle();
  if (!company) return NextResponse.json({ error: 'Only a company owner can invite collaborators' }, { status: 403 });

  // Upsert the pending membership (re-inviting updates permissions).
  const { error: upErr } = await admin.from('company_members').upsert({
    company_id: (company as any).id,
    invited_email: email,
    role: 'collaborator',
    can_edit_company: canEditCompany,
    can_edit_portfolio: canEditPortfolio,
    status: 'pending',
    invited_by: user.id,
  }, { onConflict: 'company_id,invited_email' });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Email a sign-up / accept link. redirectTo uses THIS deployment's origin so
  // UAT invites land back on UAT.
  const origin = new URL(request.url).origin;
  // ?welcome=1 tells the accept page this is a brand-new invitee, so it shows
  // the "set a password on your locked email" step to finish their account.
  const redirectTo = `${origin}/${lang}/accept-invite?welcome=1`;
  let emailSent = false;
  try {
    const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
    if (!inviteErr) emailSent = true;
    // If the person already has an account, inviteUserByEmail errors — the
    // membership still stands and they accept on their next login.
  } catch { /* email delivery is best-effort */ }

  return NextResponse.json({ ok: true, emailSent });
}
