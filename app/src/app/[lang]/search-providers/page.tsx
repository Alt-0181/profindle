import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { SearchProvidersClient } from './search-client';

export default async function SearchProvidersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  return <SearchProvidersClient lang={lang} dict={dict} />;
}
