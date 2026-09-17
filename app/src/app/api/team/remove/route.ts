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

// POST /api/team/remove  { memberId }
// Only the company OWNER may remove a member. Deleting the row revokes access
// immediately (RLS re-evaluates on the member's next request).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  let memberId: string | undefined;
  try { ({ memberId } = await request.json()); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 });

  const admin = getAdmin();

  const { data: member } = await admin
    .from('company_members').select('id, company_id').eq('id', memberId).maybeSingle();
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  // Verify the caller owns the member's company.
  const { data: company } = await admin
    .from('companies').select('id').eq('id', (member as any).company_id).eq('user_id', user.id).maybeSingle();
  if (!company) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { error } = await admin.from('company_members').delete().eq('id', memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
