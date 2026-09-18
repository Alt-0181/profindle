import { NextRequest, NextResponse } from 'next/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { acceptPendingInvites } from '@/lib/accept-invites';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// POST /api/team/accept
// Activate any pending collaborator invite for the signed-in user. Called from
// the accept-invite page right after the invite session is established. The
// caller is identified by their access token (Authorization: Bearer …) so it
// works even before the auth cookie has settled, falling back to the cookie.
export async function POST(request: NextRequest) {
  const admin = getAdmin();

  let userId = '';
  let email = '';

  const authz = request.headers.get('authorization') ?? '';
  const token = authz.startsWith('Bearer ') ? authz.slice(7) : '';
  if (token) {
    const { data } = await admin.auth.getUser(token);
    userId = data.user?.id ?? '';
    email = (data.user?.email ?? '').toLowerCase();
  }
  if (!userId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? '';
    email = (user?.email ?? '').toLowerCase();
  }
  if (!userId || !email) return NextResponse.json({ joined: false }, { status: 401 });

  const activated = await acceptPendingInvites(admin, userId, email);

  // Resolve a company name for the confirmation screen (from a freshly activated
  // membership, or an existing one if they'd already accepted).
  let joined = activated > 0;
  let companyName = '';
  const { data: membership } = await admin
    .from('company_members')
    .select('company_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (membership) {
    joined = true;
    const { data: company } = await admin
      .from('companies')
      .select('name, name_th')
      .eq('id', (membership as { company_id: string }).company_id)
      .maybeSingle();
    companyName = ((company as any)?.name_th || (company as any)?.name) ?? '';
  }

  return NextResponse.json({ joined, companyName });
}
