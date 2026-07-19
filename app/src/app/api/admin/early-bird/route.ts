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

// PATCH /api/admin/early-bird  { claimId, action: 'grant' | 'dismiss' }
export async function PATCH(request: NextRequest) {
  const caller = await requireSuperAdmin();
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { claimId, action } = await request.json();
  if (!claimId || !['grant', 'dismiss'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const admin = getAdmin();

  const { data: claim, error: claimErr } = await admin
    .from('early_bird_claims')
    .select('id, user_id, company_id, status')
    .eq('id', claimId)
    .maybeSingle();

  if (claimErr) return NextResponse.json({ error: claimErr.message }, { status: 500 });
  if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });

  if (action === 'grant') {
    // Upgrade the company to Premium. Prefer company_id; fall back to user_id
    // in case the company row was recreated after the claim was made.
    const upgrade = { premium: true, plan: 'vip' };
    let upgradeErr = null;
    if (claim.company_id) {
      ({ error: upgradeErr } = await admin.from('companies').update(upgrade).eq('id', claim.company_id));
    } else if (claim.user_id) {
      ({ error: upgradeErr } = await admin.from('companies').update(upgrade).eq('user_id', claim.user_id));
    }
    if (upgradeErr) return NextResponse.json({ error: upgradeErr.message }, { status: 500 });
  }

  const { error: updErr } = await admin
    .from('early_bird_claims')
    .update({ status: action === 'grant' ? 'granted' : 'dismissed', resolved_at: new Date().toISOString() })
    .eq('id', claimId);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
