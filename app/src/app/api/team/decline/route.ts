import { NextRequest, NextResponse } from 'next/server';
import { createClient as adminClient } from '@supabase/supabase-js';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// POST /api/team/decline  { token }
// The invited person declines the invite from the join page. We remove the
// pending membership row so they're free to sign up and create their own
// company (otherwise the signup guard would keep steering them to the invite).
// The token is the pending membership row id — the same secret in the email —
// so holding it is authorization enough, exactly like accepting.
export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const token = String(body.token ?? '').trim();
  if (!token) return NextResponse.json({ error: 'Missing invite token' }, { status: 400 });

  const admin = getAdmin();

  const { data: member } = await admin
    .from('company_members')
    .select('id, status')
    .eq('id', token)
    .maybeSingle();
  // Already gone — treat as success (idempotent).
  if (!member) return NextResponse.json({ ok: true });
  // Can't decline an invite that's already been accepted.
  if ((member as any).status !== 'pending') {
    return NextResponse.json({ error: 'This invite has already been accepted' }, { status: 409 });
  }

  await admin
    .from('company_members')
    .delete()
    .eq('id', token)
    .eq('status', 'pending');

  return NextResponse.json({ ok: true });
}
