import { notFound, redirect } from 'next/navigation';
import { hasLocale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { ImportClient } from './import-client';

export default async function AdminImportPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'super_admin') redirect(`/${lang}/home`);

  return <ImportClient lang={lang} />;
}
