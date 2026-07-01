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
    .select('id, name, verified')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!buyerCompany) return NextResponse.json({ error: 'No company profile' }, { status: 400 });
  if (!(buyerCompany as any).verified) {
    return NextResponse.json({ error: 'Your company is pending verification. An admin will review your documents shortly.' }, { status: 403 });
  }

  const body = await request.json();
  const { category, title, descriptionEn, descriptionTh, budgetBand, timeline, locationPref } = body;
  if (!category || (!descriptionTh && !descriptionEn)) {
    return NextResponse.json({ error: 'category and a description are required' }, { status: 400 });
  }

  const admin = getAdmin();

  // Monthly rate limit: 4 broadcasts per user per calendar month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { count: monthCount } = await admin
    .from('broadcasts')
    .select('id', { count: 'exact', head: true })
    .eq('buyer_user_id', user.id)
    .gte('created_at', startOfMonth);
  if ((monthCount ?? 0) >= 4) {
    return NextResponse.json({ error: 'Monthly broadcast limit reached (4 per month). Try again next month.' }, { status: 429 });
  }

  const effectiveDescEn = descriptionEn || descriptionTh || '';

  // Insert broadcast
  const { data: broadcast, error: broadcastErr } = await admin
    .from('broadcasts')
    .insert({
      buyer_user_id: user.id,
      buyer_company_id: buyerCompany.id,
      category,
      title: title ?? null,
      description_en: effectiveDescEn,
      description_th: descriptionTh ?? null,
      budget_band: budgetBand ?? null,
      timeline: timeline ?? null,
      location_pref: locationPref ?? null,
    })
    .select()
    .single();
  if (broadcastErr) return NextResponse.json({ error: broadcastErr.message }, { status: 500 });

  // Find ALL premium providers with matching services
  const { data: allProviders } = await admin
    .from('companies')
    .select('id, line_user_id')
    .neq('id', buyerCompany.id)
    .eq('premium', true)
    .contains('services', [category])
    .limit(50);

  if (!allProviders || allProviders.length === 0) {
    return NextResponse.json({ broadcastId: broadcast.id, matched: 0, notified: 0 });
  }

  // Insert match rows for ALL matched providers
  await admin.from('broadcast_matches').insert(
    allProviders.map((p: any) => ({ broadcast_id: broadcast.id, provider_company_id: p.id }))
  );

  // Fan-out LINE push only to providers with LINE connected
  const lineProviders = allProviders.filter((p: any) => p.line_user_id);
  let notified = 0;
  const pushErrors: string[] = [];

  if (lineProviders.length > 0) {
    const flexMsg = makeBroadcastFlexMessage({
      id: broadcast.id,
      category,
      budgetBand: budgetBand || '—',
      timeline: timeline || '—',
      descriptionEn: effectiveDescEn,
      buyerCompany: buyerCompany.name,
    });

    await Promise.allSettled(
      lineProviders.map(async (p: any) => {
        try {
          await pushMessage(p.line_user_id, [flexMsg]);
          await admin
            .from('broadcast_matches')
            .update({ notified_at: new Date().toISOString() })
            .eq('broadcast_id', broadcast.id)
            .eq('provider_company_id', p.id);
          notified++;
        } catch (err: any) {
          const msg = err?.message ?? String(err);
          console.error(`LINE push failed for company ${p.id}:`, msg);
          pushErrors.push(`${p.id}: ${msg}`);
        }
      })
    );
  }

  return NextResponse.json({ broadcastId: broadcast.id, matched: allProviders.length, notified, pushErrors });
}
