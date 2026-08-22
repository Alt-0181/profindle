import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { revertCompanyToUnclaimed } from '@/lib/revert-company';

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

  // A company the user CLAIMED that was originally a seeded listing must survive
  // (revert to unclaimed) — deleting it would silently shrink the directory.
  // A company the user CREATED from scratch is their own content → delete it.
  const { data: owned } = await admin
    .from('companies')
    .select('id, source')
    .eq('user_id', user.id);

  for (const c of owned ?? []) {
    if ((c as { source?: string }).source === 'seeded') {
      await revertCompanyToUnclaimed(admin, (c as { id: string }).id);
    } else {
      await admin.from('portfolio_projects').delete().eq('company_id', (c as { id: string }).id);
      await admin.from('companies').delete().eq('id', (c as { id: string }).id);
    }
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
