import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from '@/dictionaries';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://profindle.com';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isTh = lang === 'th';
  return {
    title: isTh
      ? { template: '%s | Profindle', default: 'Profindle — ตลาด B2B ของไทย' }
      : { template: '%s | Profindle', default: 'Profindle — Thailand B2B Service Marketplace' },
    description: isTh
      ? 'ค้นหาผู้ให้บริการ B2B ในไทยที่ผ่านการยืนยัน — ดิจิทัลมาร์เก็ตติ้ง, IT, กฎหมาย, อีเว้นท์ และอื่นๆ ฟรี ไม่ต้องใช้บัตรเครดิต'
      : 'Find verified B2B service providers across Thailand — Digital Marketing, IT, Legal, Events and more. Free, no credit card required.',
    alternates: {
      canonical: `${siteUrl}/${lang}`,
      languages: {
        en: `${siteUrl}/en`,
        th: `${siteUrl}/th`,
        'x-default': `${siteUrl}/en`,
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'th' }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <>{children}</>;
}
