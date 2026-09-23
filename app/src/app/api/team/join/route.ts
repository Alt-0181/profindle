import { NextRequest, NextResponse } from 'next/server';
import { createClient as adminClient } from '@supabase/supabase-js';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// POST /api/team/join  { token, password }
// Finish a collaborator invite: create the invitee's account with the password
// they chose (email is fixed by the invite token) and activate their membership.
// If the email already has an account, tell them to sign in instead.
export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const token = String(body.token ?? '').trim();
  const password = String(body.password ?? '');
  if (!token) return NextResponse.json({ error: 'Missing invite token' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

  const admin = getAdmin();

  // The invite token is the pending membership row id.
  const { data: member } = await admin
    .from('company_members')
    .select('id, invited_email, status')
    .eq('id', token)
    .maybeSingle();
  if (!member) return NextResponse.json({ error: 'This invite link is invalid or has expired' }, { status: 404 });

  const email = (member as any).invited_email as string;

  // Create the account with their chosen password (email confirmed — this is an
  // invite, the email is already trusted).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: email.split('@')[0] },
  });

  if (createErr) {
    const msg = (createErr.message || '').toLowerCase();
    if (msg.includes('already') && msg.includes('registered')) {
      // They already have an account — they should sign in; auto-accept on login
      // will add them to the team.
      return NextResponse.json({ exists: true, email }, { status: 200 });
    }
    return NextResponse.json({ error: createErr.message }, { status: 500 });
  }

  const newUserId = created.user?.id;
  if (!newUserId) return NextResponse.json({ error: 'Could not create account' }, { status: 500 });

  // Activate this membership (and any other pending invite to the same email).
  await admin
    .from('company_members')
    .update({ user_id: newUserId, status: 'active', accepted_at: new Date().toISOString() })
    .eq('invited_email', email)
    .eq('status', 'pending');

  // Hand the client a one-time verification token so it can establish the
  // session directly (verifyOtp) instead of a password sign-in. Password
  // sign-in from the browser is rejected when the project enforces captcha
  // (the join form has no captcha), which was bouncing new collaborators to
  // the login page instead of the dashboard. generateLink uses the admin API,
  // so it isn't captcha-gated. Falls back to password sign-in if unavailable.
  let tokenHash: string | null = null;
  try {
    const { data: link } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
    tokenHash = (link as any)?.properties?.hashed_token ?? null;
  } catch { /* client will fall back to password sign-in */ }

  return NextResponse.json({ ok: true, email, tokenHash });
}
