import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { PortfolioClient } from './portfolio-client';

export default async function PortfolioPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user?.id ?? '')
    .maybeSingle();

  const companyId = company?.id ?? null;

  const { data: projectRows } = companyId
    ? await supabase
        .from('portfolio_projects')
        .select('id, title, client, confidential, year, budget, category, description, description_th, results, results_th, challenge, challenge_th, images, services')
        .eq('company_id', companyId)
        .order('sort_order', { ascending: true })
    : { data: [] };

  const initialProjects = (projectRows ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    client: p.client ?? '',
    confidential: p.confidential ?? false,
    year: p.year ? String(p.year) : '',
    budget: p.budget ?? '',
    category: p.category ?? '',
    descEn: p.description ?? '',
    descTh: p.description_th ?? '',
    resultsEn: p.results ?? '',
    resultsTh: p.results_th ?? '',
    challengeEn: p.challenge ?? '',
    challengeTh: p.challenge_th ?? '',
    images: p.images ?? [],
    services: p.services ?? [],
  }));

  return (
    <div className="page-body">
      <PortfolioClient lang={lang} dict={dict} companyId={companyId} initialProjects={initialProjects} />
    </div>
  );
}
