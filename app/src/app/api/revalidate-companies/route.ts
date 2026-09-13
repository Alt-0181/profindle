import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidateCompanies } from '@/lib/revalidate';

// Lets the (client-side) My Company form refresh the public search cache right
// after a provider saves their profile. Auth-gated so only signed-in users can
// trigger a revalidation.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  revalidateCompanies();
  return NextResponse.json({ ok: true });
}
