import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from './settings-client';

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ line?: string; section?: string }>;
}) {
  const { lang } = await params;
  const { line, section } = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from('companies')
    .select('line_user_id, line_display_name, premium, plan')
    .eq('user_id', user?.id ?? '')
    .maybeSingle();

  const lineUserId = (company as any)?.line_user_id ?? null;
  const lineDisplayName = (company as any)?.line_display_name ?? null;
  const isPremium = !!(
    (company as any)?.premium ||
    ['vip', 'premium'].includes((company as any)?.plan ?? '')
  );
  const userName: string = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  return (
    <div className="page-body">
      <SettingsClient
        lang={lang}
        dict={dict}
        initialLineUserId={lineUserId}
        initialLineDisplayName={lineDisplayName}
        userEmail={user?.email ?? ''}
        userName={userName}
        lineOAuthResult={line ?? null}
        initialSection={section ?? null}
        isPremium={isPremium}
      />
    </div>
  );
}
