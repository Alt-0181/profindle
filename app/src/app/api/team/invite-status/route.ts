import { NextRequest, NextResponse } from 'next/server';
import { createClient as adminClient } from '@supabase/supabase-js';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// GET /api/team/invite-status?email=...
// Does this email already have a PENDING collaborator invite? Signup calls this
// to steer an invited person toward accepting (or declining) the invite instead
// of creating a separate company they didn't mean to own.
//
// Security: we deliberately return only { pending, companyName } — never the
// invite token. The token lets someone set a password and claim the seat, so it
// must stay inside the emailed link and never be handed out by email lookup.
export async function GET(request: NextRequest) {
  const email = (request.nextUrl.searchParams.get('email') ?? '').trim().toLowerCase();
  if (!email) return NextResponse.json({ pending: false });

  const admin = getAdmin();
  const { data: member, error } = await admin
    .from('company_members')
    .select('company_id')
    .eq('invited_email', email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  // If the table is absent on this environment, or nothing pending, don't block.
  if (error || !member) return NextResponse.json({ pending: false });

  const { data: company } = await admin
    .from('companies')
    .select('name, name_th')
    .eq('id', (member as any).company_id)
    .maybeSingle();
  const companyName = ((company as any)?.name_th || (company as any)?.name) ?? '';

  return NextResponse.json({ pending: true, companyName });
}
