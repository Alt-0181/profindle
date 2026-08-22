import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';

// POST /api/claim  { companyId }
// Maps an UNCLAIMED seeded company to the currently signed-in account: sets
// user_id + claimed=true so the owner can manage the existing profile (keeping
// its views/data). verified stays false until a super-admin checks the uploaded
// registration document.
export async function POST(request: NextRequest) {
  // Must be signed in (the just-registered provider).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  let companyId: string;
  try { ({ companyId } = await request.json()); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  const admin = adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // The account can only manage one company. If they already own one, block —
  // otherwise My Company (which loads a single company by user_id) would break.
  const { data: existing } = await admin.from('companies').select('id').eq('user_id', user.id).maybeSingle();
  if (existing) return NextResponse.json({ error: 'You already manage a company on this account.' }, { status: 409 });

  // The target must exist and be unclaimed.
  const { data: company } = await admin
    .from('companies')
    .select('id, claimed, user_id, name')
    .eq('id', companyId)
    .maybeSingle();
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  if (company.claimed !== false || company.user_id) {
    return NextResponse.json({ error: 'This business has already been claimed.' }, { status: 409 });
  }

  // Claim it. Guarded on claimed=false so two simultaneous claims can't both win.
  const { error, data: updated } = await admin
    .from('companies')
    // Keep source as-is (a seeded listing stays source='seeded' after being
    // claimed) so that if the owner later deletes their account, the listing is
    // reverted to unclaimed instead of being destroyed.
    .update({ user_id: user.id, claimed: true, updated_at: new Date().toISOString() })
    .eq('id', companyId)
    .eq('claimed', false)
    .select('id')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!updated) return NextResponse.json({ error: 'This business has already been claimed.' }, { status: 409 });

  return NextResponse.json({ ok: true, companyName: company.name });
}
