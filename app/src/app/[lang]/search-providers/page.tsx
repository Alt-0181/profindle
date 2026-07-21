import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { SearchProvidersClient } from './search-client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://profindle.com';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isTh = lang === 'th';
  return {
    title: isTh ? 'ค้นหาผู้ให้บริการ' : 'Find Service Providers',
    description: isTh
      ? 'ค้นหาผู้ให้บริการ B2B ในไทยจากกว่า 400 บริการ ตัวกรองตามจังหวัด อุตสาหกรรม และงบประมาณ'
      : 'Search verified B2B service providers in Thailand across 400+ service categories. Filter by province, industry, and budget.',
    alternates: {
      canonical: `${siteUrl}/${lang}/search-providers`,
      languages: { en: `${siteUrl}/en/search-providers`, th: `${siteUrl}/th/search-providers`, 'x-default': `${siteUrl}/en/search-providers` },
    },
  };
}

export type Company = {
  id: string;
  name: string;
  name_th: string | null;
  description: string | null;
  description_th: string | null;
  province: string | null;
  services: string[];
  industry: string | null;
  verified: boolean;
  premium: boolean;
  views: number;
  logo_initial: string | null;
  logo_url: string | null;
  banner_url: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  founded_year: number | null;
  team_size: string | null;
  address: string | null;
  line_id: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  portfolioBudgets: string[];
};

export default async function SearchProvidersPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ lang }, { q }] = await Promise.all([params, searchParams]);
  if (!hasLocale(lang)) notFound();

  const [dict, supabase] = await Promise.all([
    getDictionary(lang as Locale),
    createClient(),
  ]);

  const [{ data: companies }, { data: portfolioBudgetRows }] = await Promise.all([
    supabase
      .from('companies')
      .select('id, name, name_th, description, description_th, province, services, industry, verified, premium, views, logo_initial, logo_url, banner_url, banner_focus_x, banner_focus_y, email, phone, website, founded_year, team_size, address, line_id, social_facebook, social_instagram')
      .order('premium', { ascending: false })
      .order('views', { ascending: false }),
    supabase
      .from('portfolio_projects')
      .select('company_id, budget')
      .not('budget', 'is', null),
  ]);

  const budgetMap: Record<string, string[]> = {};
  for (const row of portfolioBudgetRows ?? []) {
    if (!row.budget) continue;
    if (!budgetMap[row.company_id]) budgetMap[row.company_id] = [];
    if (!budgetMap[row.company_id].includes(row.budget)) budgetMap[row.company_id].push(row.budget);
  }

  const companiesWithBudgets = (companies ?? [])
    .filter((c) => c.name)
    .map((c) => ({
      ...c,
      portfolioBudgets: budgetMap[c.id] ?? [],
    }));

  const provinces = [...new Set(companiesWithBudgets.map((c) => c.province).filter(Boolean))] as string[];

  return <SearchProvidersClient lang={lang} dict={dict} companies={companiesWithBudgets} provinces={provinces} initialQuery={q ?? ''} />;
}
