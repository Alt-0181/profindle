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

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (user.user_metadata?.role !== 'super_admin') return null;
  return user;
}

// PATCH /api/admin/companies  { companyId, field: 'verified'|'premium', value: boolean }
export async function PATCH(request: NextRequest) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { companyId, field, value } = await request.json();
  if (!companyId || !['verified', 'premium', 'line_user_id'].includes(field)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const admin = getAdmin();
  const { error } = await admin
    .from('companies')
    .update({ [field]: value })
    .eq('id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
