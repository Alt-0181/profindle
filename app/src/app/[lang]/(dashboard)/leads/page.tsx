import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { LeadsClient, type Lead } from './leads-client';

export default async function LeadsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const isTh = lang === 'th';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from('companies')
    .select('id, premium')
    .eq('user_id', user?.id ?? '')
    .maybeSingle();

  // No company yet → prompt to set one up (leads require a provider profile).
  if (!company) {
    return (
      <div className="page-body">
        <div style={{ maxWidth: '640px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{isTh ? 'คำขอที่เข้ามา' : 'Leads'}</h1>
          <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '24px' }}>{isTh ? 'ตั้งค่าโปรไฟล์บริษัทก่อนเพื่อรับคำขอจากลูกค้า' : 'Set up your company profile first to receive buyer requests.'}</p>
          <Link href={`/${lang}/my-company`} style={{ display: 'inline-flex', padding: '10px 20px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            {isTh ? 'ตั้งค่าบริษัท' : 'Set up company'}
          </Link>
        </div>
      </div>
    );
  }

  // broadcast_matches has no provider-side RLS read policy, so use the service
  // role, scoped to this company only, and embed the broadcast + buyer name.
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: rows } = await admin
    .from('broadcast_matches')
    .select('broadcast_id, provider_response, matched_at, broadcasts:broadcast_id ( id, category, title, description_en, description_th, budget_band, timeline, location_pref, created_at, buyer:buyer_company_id ( name, name_th ) )')
    .eq('provider_company_id', (company as { id: string }).id)
    .order('matched_at', { ascending: false })
    .limit(200);

  const leads: Lead[] = (rows ?? [])
    .filter((r: any) => r.broadcasts)
    .map((r: any) => {
      const b = r.broadcasts;
      const buyer = b.buyer;
      return {
        broadcastId: b.id,
        category: b.category,
        title: b.title ?? null,
        description: (isTh ? b.description_th : b.description_en) || b.description_en || b.description_th || '',
        budget: b.budget_band ?? null,
        timeline: b.timeline ?? null,
        location: b.location_pref ?? null,
        buyerName: (isTh && buyer?.name_th ? buyer.name_th : buyer?.name) ?? null,
        postedAt: b.created_at,
        response: r.provider_response ?? 'no_reply',
      };
    });

  return (
    <div className="page-body">
      <LeadsClient lang={lang as Locale} leads={leads} isPremium={!!(company as any).premium} />
    </div>
  );
}
