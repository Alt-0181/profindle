import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { PublicNav } from '@/components/layout/public-nav';
import { INDUSTRIES } from '@/lib/services';
import { serviceSlug } from '@/lib/directory';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://profindle.com';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isTh = lang === 'th';
  return {
    title: isTh ? 'บริการทั้งหมด — ผู้ให้บริการ B2B ในไทย | Profindle' : 'All Services — Thai B2B Service Providers | Profindle',
    description: isTh
      ? 'เรียกดูบริการ B2B กว่า 250 ประเภทในประเทศไทย ค้นหาผู้ให้บริการที่ผ่านการตรวจสอบตามบริการและจังหวัด'
      : 'Browse 250+ B2B service categories in Thailand. Find verified providers by service and province.',
    alternates: {
      canonical: `${siteUrl}/${lang}/services`,
      languages: { en: `${siteUrl}/en/services`, th: `${siteUrl}/th/services` },
    },
  };
}

export default async function ServicesIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const isTh = lang === 'th';

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", minHeight: '100vh', background: '#F4F5F7' }}>
      <PublicNav locale={lang} dict={dict} dark={false} />

      <div style={{ background: 'linear-gradient(140deg, #0E1017 0%, #0F6F73 100%)', padding: 'clamp(28px,5vw,44px) 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            {isTh ? 'บริการทั้งหมด' : 'Browse All Services'}
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            {isTh ? 'ค้นหาผู้ให้บริการ B2B ที่ผ่านการตรวจสอบตามประเภทบริการ' : 'Find verified Thai B2B providers by service category'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(16px,4vw,24px) 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {INDUSTRIES.map((ind) => (
            <div key={ind.name} style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21', marginBottom: '12px' }}>{isTh ? ind.th : ind.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {ind.services.map((s) => (
                  <Link key={s} href={`/${lang}/services/${serviceSlug(s)}`} style={{ fontSize: '12.5px', fontWeight: 500, padding: '5px 12px', borderRadius: '999px', background: '#F0F9F9', color: '#0F6F73', textDecoration: 'none' }}>
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
