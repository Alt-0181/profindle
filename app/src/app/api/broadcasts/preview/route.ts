import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category');
  if (!category) return NextResponse.json({ count: 0 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let buyerCompanyId: string | null = null;
  if (user) {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    buyerCompanyId = company?.id ?? null;
  }

  let query = getAdmin()
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('premium', true)
    .contains('services', [category]);

  if (buyerCompanyId) {
    query = query.neq('id', buyerCompanyId);
  }

  const { count } = await query;

  return NextResponse.json({ count: count ?? 0 });
}
