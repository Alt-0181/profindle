import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { pushMessage, makeBroadcastFlexMessage } from '@/lib/line';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: buyerCompany } = await supabase
    .from('companies')
    .select('id, name')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!buyerCompany) return NextResponse.json({ error: 'No company profile' }, { status: 400 });

  const body = await request.json();
  const { category, descriptionEn, descriptionTh, budgetBand, timeline, locationPref } = body;
  if (!category || !descriptionEn) {
    return NextResponse.json({ error: 'category and descriptionEn are required' }, { status: 400 });
  }

  const admin = getAdmin();

  // Insert broadcast
  const { data: broadcast, error: broadcastErr } = await admin
    .from('broadcasts')
    .insert({
      buyer_user_id: user.id,
      buyer_company_id: buyerCompany.id,
      category,
      description_en: descriptionEn,
      description_th: descriptionTh ?? null,
      budget_band: budgetBand ?? null,
      timeline: timeline ?? null,
      location_pref: locationPref ?? null,
    })
    .select()
    .single();
  if (broadcastErr) return NextResponse.json({ error: broadcastErr.message }, { status: 500 });

  // Find matching providers: any company with a LINE UID, excluding the buyer
  // v1: notify all LINE-connected providers; add category/budget matching later
  const { data: providers } = await admin
    .from('companies')
    .select('id, line_user_id')
    .not('line_user_id', 'is', null)
    .neq('id', buyerCompany.id)
    .order('premium', { ascending: false })
    .limit(50);

  if (!providers || providers.length === 0) {
    return NextResponse.json({ broadcastId: broadcast.id, notified: 0 });
  }

  // Insert match rows
  await admin.from('broadcast_matches').insert(
    providers.map((p: any) => ({ broadcast_id: broadcast.id, provider_company_id: p.id }))
  );

  // Fan-out LINE push
  const flexMsg = makeBroadcastFlexMessage({
    id: broadcast.id,
    category,
    budgetBand: budgetBand || '—',
    timeline: timeline || '—',
    descriptionEn,
    buyerCompany: buyerCompany.name,
  });

  let notified = 0;
  await Promise.allSettled(
    providers.map(async (p: any) => {
      try {
        await pushMessage(p.line_user_id, [flexMsg]);
        await admin
          .from('broadcast_matches')
          .update({ notified_at: new Date().toISOString() })
          .eq('broadcast_id', broadcast.id)
          .eq('provider_company_id', p.id);
        notified++;
      } catch (err) {
        console.error(`LINE push failed for company ${p.id}:`, err);
      }
    })
  );

  return NextResponse.json({ broadcastId: broadcast.id, notified });
}
