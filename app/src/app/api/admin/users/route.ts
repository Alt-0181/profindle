import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { deleteUserAccount } from '@/lib/delete-user';
import { revalidateCompanies } from '@/lib/revalidate';

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
  if (!user) return null;
  if (user.user_metadata?.role !== 'super_admin') return null;
  return user;
}

// DELETE /api/admin/users  { userId }
export async function DELETE(request: NextRequest) {
  const caller = await requireSuperAdmin();
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  if (userId === caller.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const admin = getAdmin();

  // Same safe cleanup as user self-delete: revert claimed-seeded listings to
  // unclaimed (keep them in the directory), delete user-created companies, then
  // delete the auth user.
  const error = await deleteUserAccount(admin, userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateCompanies();
  return NextResponse.json({ ok: true });
}
