import { NextRequest, NextResponse } from 'next/server';
import { createClient as adminClient } from '@supabase/supabase-js';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const province = searchParams.get('province');
  const verifiedOnly = searchParams.get('verified') === 'true';

  const admin = getAdmin();
  let dbQuery = admin
    .from('companies')
    .select('id, name, name_th, industry, province, verified, premium, services, views')
    .order('premium', { ascending: false })
    .order('views', { ascending: false });

  if (verifiedOnly) dbQuery = dbQuery.eq('verified', true);
  if (province) dbQuery = dbQuery.eq('province', province);

  const { data: companies, error } = await dbQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let results = companies ?? [];
  if (query) {
    const q = query.toLowerCase();
    results = results.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.name_th?.toLowerCase().includes(q)) ||
      c.services?.some((s: string) => s.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({ companies: results, total: results.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ id: Date.now().toString(), ...body }, { status: 201 });
}
