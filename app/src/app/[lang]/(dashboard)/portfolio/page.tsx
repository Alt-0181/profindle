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
        .select('id, title, client, confidential, year, images')
        .eq('company_id', companyId)
        .order('sort_order', { ascending: true })
    : { data: [] };

  const initialProjects = (projectRows ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    client: p.confidential
      ? (lang === 'th' ? 'ไม่เปิดเผย' : 'Confidential')
      : (p.client ?? ''),
    year: p.year ? String(p.year) : '',
    coverImage: (p.images && p.images.length > 0) ? p.images[0] : null,
  }));

  return (
    <div className="page-body">
      <PortfolioClient lang={lang} dict={dict} companyId={companyId} initialProjects={initialProjects} />
    </div>
  );
}
