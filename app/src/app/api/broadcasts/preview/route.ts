import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category');
  if (!category) return NextResponse.json({ count: 0 });

  const { count } = await getAdmin()
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('premium', true)
    .contains('services', [category]);

  return NextResponse.json({ count: count ?? 0 });
}
