import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { BroadcastRequestClient } from './broadcast-client';

export default async function BroadcastRequestPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  return (
    <div className="page-body">
      <BroadcastRequestClient lang={lang} dict={dict} />
    </div>
  );
}
