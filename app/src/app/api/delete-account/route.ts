import { NextResponse } from 'next/server';
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

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = getAdmin();

  const error = await deleteUserAccount(admin, user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateCompanies();
  return NextResponse.json({ ok: true });
}
