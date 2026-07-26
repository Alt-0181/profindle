import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { PublicNav } from '@/components/layout/public-nav';
import { AiSearchClient } from './ai-search-client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://profindle.com';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isTh = lang === 'th';
  return {
    title: isTh ? 'ค้นหาด้วย AI' : 'AI Search',
    description: isTh
      ? 'ค้นหาผู้ให้บริการ B2B ที่ตรงกับความต้องการของคุณด้วยผู้ช่วย AI — ดูผลงานจริงจากพอร์ตโฟลิโอ'
      : 'Find the right B2B provider with an AI assistant — matched to your need, with real portfolio work shown.',
    alternates: { canonical: `${siteUrl}/${lang}/ai-search` },
  };
}

export default async function AiSearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", minHeight: '100vh', background: '#F6F8F8' }}>
      <PublicNav locale={lang} dict={dict} />
      <AiSearchClient lang={lang} />
    </div>
  );
}
