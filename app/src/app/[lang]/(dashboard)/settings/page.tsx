import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from './settings-client';

export default async function SettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from('companies')
    .select('line_user_id')
    .eq('user_id', user?.id ?? '')
    .maybeSingle();

  const lineUserId = (company as any)?.line_user_id ?? null;
  const userName: string = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  return (
    <div className="page-body">
      <SettingsClient lang={lang} dict={dict} initialLineUserId={lineUserId} userEmail={user?.email ?? ''} userName={userName} />
    </div>
  );
}
