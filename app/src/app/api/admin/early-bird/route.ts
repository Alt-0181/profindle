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
    // Use 'premium' — it matches the "Premium" tier in the pricing UI and the
    // companies_plan_check DB constraint (which does not include 'vip').
    // Early Bird premium is free until 31 Mar 2027 (Bangkok end-of-day).
    const PREMIUM_UNTIL = '2027-03-31T23:59:59+07:00';
    const runUpgrade = (payload: Record<string, unknown>) =>
      claim.company_id
        ? admin.from('companies').update(payload).eq('id', claim.company_id)
        : admin.from('companies').update(payload).eq('user_id', claim.user_id);

    if (!claim.company_id && !claim.user_id) {
      return NextResponse.json({ error: 'Claim has no company or user to upgrade' }, { status: 400 });
    }

    let { error: upgradeErr } = await runUpgrade({ premium: true, plan: 'premium', premium_until: PREMIUM_UNTIL });
    // If the premium_until column has not been migrated yet, fall back to the
    // basic upgrade so the grant still succeeds (run supabase-premium-until.sql).
    if (upgradeErr && /premium_until/i.test(upgradeErr.message)) {
      ({ error: upgradeErr } = await runUpgrade({ premium: true, plan: 'premium' }));
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
