import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { PublicNav } from '@/components/layout/public-nav';
import { serviceFromSlug, provinceSlug, MIN_INDEXABLE } from '@/lib/directory';
import { ProviderCard, type DirCompany } from '../provider-card';
import { JsonLd } from '@/components/seo/json-ld';

export const dynamic = 'force-dynamic';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://profindle.com';
const CARD_FIELDS = 'id, name, name_th, description, description_th, province, services, verified, claimed, premium, logo_initial, logo_url';

export async function generateMetadata({ params }: { params: Promise<{ lang: string; service: string }> }): Promise<Metadata> {
  const { lang, service } = await params;
  const svc = serviceFromSlug(service);
  if (!svc) return {};
  const supabase = await createClient();
  const { count } = await supabase.from('companies').select('id', { count: 'exact', head: true }).contains('services', [svc]);
  const n = count ?? 0;
  const isTh = lang === 'th';
  return {
    title: isTh ? `${svc} — ${n} ผู้ให้บริการในไทย | Profindle` : `${svc} Providers in Thailand — ${n} Companies | Profindle`,
    description: isTh
      ? `เปรียบเทียบผู้ให้บริการ ${svc} ${n} รายทั่วไทย ดูผลงาน ติดต่อโดยตรง หรือประกาศหาผู้ให้บริการ — ฟรี`
      : `Browse ${n} verified ${svc} providers across Thailand. Compare portfolios, contact directly, or broadcast your request — free.`,
    robots: n < MIN_INDEXABLE ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `${siteUrl}/${lang}/services/${service}`,
      languages: { en: `${siteUrl}/en/services/${service}`, th: `${siteUrl}/th/services/${service}` },
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ lang: string; service: string }> }) {
  const { lang, service } = await params;
  if (!hasLocale(lang)) notFound();
  const svc = serviceFromSlug(service);
  if (!svc) notFound();

  const [dict, supabase] = await Promise.all([getDictionary(lang as Locale), createClient()]);
  const { data } = await supabase
    .from('companies')
    .select(CARD_FIELDS)
    .contains('services', [svc])
    .order('claimed', { ascending: false })
    .order('premium', { ascending: false })
    .order('views', { ascending: false });
  const companies = ((data ?? []) as DirCompany[]).filter((c) => c.verified || !c.claimed);
  const isTh = lang === 'th';

  // Province breakdown → internal links to the service×province pages.
  const provCount: Record<string, number> = {};
  for (const c of companies) if (c.province) provCount[c.province] = (provCount[c.province] ?? 0) + 1;
  const provinces = Object.entries(provCount).sort((a, b) => b[1] - a[1]);

  const base = `${siteUrl}/${lang}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: isTh ? 'บริการ' : 'Services', item: `${base}/services` },
        { '@type': 'ListItem', position: 2, name: svc, item: `${base}/services/${service}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: isTh ? `ผู้ให้บริการ ${svc} ในประเทศไทย` : `${svc} providers in Thailand`,
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
            <Link href={`/${lang}/services`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{isTh ? 'บริการ' : 'Services'}</Link>{' / '}{svc}
          </div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {isTh ? `ผู้ให้บริการ ${svc} ในประเทศไทย` : `${svc} Providers in Thailand`}
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            {isTh ? `ผู้ให้บริการที่ผ่านการตรวจสอบ ${companies.length} ราย` : `${companies.length} verified ${companies.length === 1 ? 'provider' : 'providers'}`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(16px,4vw,24px) 24px 60px' }}>
        {/* Province links */}
        {provinces.length > 1 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{isTh ? 'ตามจังหวัด' : 'By province'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {provinces.map(([p, n]) => (
                <Link key={p} href={`/${lang}/services/${service}/${provinceSlug(p)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '999px', border: '1px solid rgba(15,111,115,0.18)', background: 'white', color: '#444B5A', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                  {p}<span style={{ fontSize: '11px', color: '#9AA0AE' }}>{n}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {companies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'linear-gradient(135deg, #F0F9F9, #E6F4F4)', borderRadius: '16px', border: '1px dashed rgba(15,111,115,0.25)' }}>
            <div style={{ fontWeight: 700, fontSize: '17px', color: '#171A21', marginBottom: '6px' }}>{isTh ? `ยังไม่มีผู้ให้บริการ ${svc}` : `No ${svc} providers yet`}</div>
            <Link href={`/${lang}/broadcast-request`} style={{ display: 'inline-block', marginTop: '10px', padding: '11px 22px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none' }}>{isTh ? 'ประกาศคำขอ — ฟรี' : 'Broadcast a request — Free'}</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {companies.map((c) => <ProviderCard key={c.id} c={c} lang={lang} />)}
          </div>
        )}
      </div>
    </div>
  );
}
