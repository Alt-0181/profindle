import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { PublicNav } from '@/components/layout/public-nav';
import { serviceFromSlug, provinceFromSlug, serviceSlug, MIN_INDEXABLE } from '@/lib/directory';
import { ProviderCard, type DirCompany } from '../../provider-card';
import { JsonLd } from '@/components/seo/json-ld';

export const dynamic = 'force-dynamic';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://profindle.com';

const CARD_FIELDS = 'id, name, name_th, description, description_th, province, services, verified, premium, logo_initial, logo_url';

export async function generateMetadata({ params }: { params: Promise<{ lang: string; service: string; province: string }> }): Promise<Metadata> {
  const { lang, service, province } = await params;
  const svc = serviceFromSlug(service);
  const prov = provinceFromSlug(province);
  if (!svc || !prov) return {};
  const supabase = await createClient();
  const { count } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .contains('services', [svc])
    .eq('province', prov);
  const n = count ?? 0;
  const isTh = lang === 'th';
  const title = isTh
    ? `${svc} ใน${prov} — ${n} ผู้ให้บริการ | Profindle`
    : `${svc} in ${prov}, Thailand — ${n} Providers | Profindle`;
  const description = isTh
    ? `เปรียบเทียบผู้ให้บริการ ${svc} ${n} รายใน${prov} ดูผลงาน ติดต่อโดยตรง หรือประกาศหาผู้ให้บริการ — ฟรี`
    : `Compare ${n} verified ${svc} providers in ${prov}, Thailand. View portfolios, contact directly, or broadcast your request — free.`;
  return {
    title,
    description,
    robots: n < MIN_INDEXABLE ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `${siteUrl}/${lang}/services/${service}/${province}`,
      languages: {
        en: `${siteUrl}/en/services/${service}/${province}`,
        th: `${siteUrl}/th/services/${service}/${province}`,
      },
    },
  };
}

export default async function ServiceProvincePage({ params }: { params: Promise<{ lang: string; service: string; province: string }> }) {
  const { lang, service, province } = await params;
  if (!hasLocale(lang)) notFound();
  const svc = serviceFromSlug(service);
  const prov = provinceFromSlug(province);
  if (!svc || !prov) notFound();

  const [dict, supabase] = await Promise.all([getDictionary(lang as Locale), createClient()]);
  const { data } = await supabase
    .from('companies')
    .select(CARD_FIELDS)
    .contains('services', [svc])
    .eq('province', prov)
    .order('claimed', { ascending: false })
    .order('premium', { ascending: false })
    .order('views', { ascending: false });
  const companies = (data ?? []) as DirCompany[];
  const isTh = lang === 'th';

  const base = `${siteUrl}/${lang}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: isTh ? 'บริการ' : 'Services', item: `${base}/services` },
        { '@type': 'ListItem', position: 2, name: svc, item: `${base}/services/${service}` },
        { '@type': 'ListItem', position: 3, name: prov, item: `${base}/services/${service}/${province}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: isTh ? `${svc} ใน${prov}` : `${svc} in ${prov}, Thailand`,
      numberOfItems: companies.length,
      itemListElement: companies.slice(0, 30).map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${base}/providers/${c.id}`,
        name: (isTh && c.name_th ? c.name_th : c.name) as string,
      })),
    },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", minHeight: '100vh', background: '#F4F5F7' }}>
      <JsonLd data={jsonLd} />
      <PublicNav locale={lang} dict={dict} dark={false} />

      <div style={{ background: 'linear-gradient(140deg, #0E1017 0%, #0F6F73 100%)', padding: 'clamp(28px,5vw,44px) 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '10px' }}>
            <Link href={`/${lang}/services`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{isTh ? 'บริการ' : 'Services'}</Link>
            {' / '}
            <Link href={`/${lang}/services/${service}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{svc}</Link>
            {' / '}{prov}
          </div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {isTh ? `${svc} ใน${prov}` : `${svc} in ${prov}`}
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            {isTh ? `ผู้ให้บริการ B2B ที่ผ่านการตรวจสอบ ${companies.length} ราย` : `${companies.length} verified B2B ${companies.length === 1 ? 'provider' : 'providers'} in ${prov}`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(16px,4vw,24px) 24px 60px' }}>
        {companies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'linear-gradient(135deg, #F0F9F9, #E6F4F4)', borderRadius: '16px', border: '1px dashed rgba(15,111,115,0.25)' }}>
            <div style={{ fontWeight: 700, fontSize: '17px', color: '#171A21', marginBottom: '6px' }}>
              {isTh ? `ยังไม่มีผู้ให้บริการ ${svc} ใน${prov}` : `No ${svc} providers in ${prov} yet`}
            </div>
            <p style={{ fontSize: '13px', color: '#6B7385', marginBottom: '18px' }}>
              {isTh ? 'ประกาศคำขอแล้วผู้ให้บริการที่ตรงกันจะติดต่อกลับ — ฟรี' : 'Broadcast your request and matching providers will reach out — free.'}
            </p>
            <Link href={`/${lang}/broadcast-request`} style={{ display: 'inline-block', padding: '11px 22px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none' }}>
              {isTh ? 'ประกาศคำขอ — ฟรี' : 'Broadcast a request — Free'}
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {companies.map((c) => <ProviderCard key={c.id} c={c} lang={lang} />)}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href={`/${lang}/services/${serviceSlug(svc)}`} style={{ fontSize: '14px', color: '#0F6F73', fontWeight: 600, textDecoration: 'none' }}>
                {isTh ? `ดู ${svc} ทั่วประเทศไทย →` : `See all ${svc} providers across Thailand →`}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
