import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { SearchProvidersClient } from './search-client';

export type Company = {
  id: string;
  name: string;
  name_th: string | null;
  description: string | null;
  description_th: string | null;
  province: string | null;
  services: string[];
  verified: boolean;
  premium: boolean;
  views: number;
  logo_initial: string | null;
};

export default async function SearchProvidersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, supabase] = await Promise.all([
    getDictionary(lang as Locale),
    createClient(),
  ]);

  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, name_th, description, description_th, province, services, verified, premium, views, logo_initial')
    .order('premium', { ascending: false })
    .order('views', { ascending: false });

  const provinces = [...new Set((companies ?? []).map((c) => c.province).filter(Boolean))] as string[];

  return <SearchProvidersClient lang={lang} dict={dict} companies={companies ?? []} provinces={provinces} />;
}
