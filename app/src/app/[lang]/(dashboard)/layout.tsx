import { notFound, redirect } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { acceptPendingInvites } from '@/lib/accept-invites';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login`);

  const fullName: string = user.user_metadata?.full_name || user.email || 'User';
  const firstName = fullName.split(' ')[0];
  const initial = firstName[0]?.toUpperCase() || 'U';
  const isAdmin = user.user_metadata?.role === 'super_admin';

  const currentUser = {
    initial,
    fullName: fullName.length > 22 ? fullName.slice(0, 20) + '…' : fullName,
    firstName,
    plan: 'free' as const,
    email: user.email || '',
    company: null,
  };

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Auto-accept: if this user was invited as a collaborator, activate the
  // pending invite the moment they sign in — no invite link needed.
  await acceptPendingInvites(admin, user.id, user.email);

  const { data: myCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  const hasCompany = !!myCompany;

  // Unactioned leads (broadcast requests matched to this provider, not yet
  // responded to) → sidebar badge. broadcast_matches has no provider-side RLS
  // read policy, so count via the service role, scoped to this company only.
  let leadsCount = 0;
  if (myCompany) {
    const { count } = await admin
      .from('broadcast_matches')
      .select('id', { count: 'exact', head: true })
      .eq('provider_company_id', (myCompany as { id: string }).id)
      .eq('provider_response', 'no_reply');
    leadsCount = count ?? 0;
  }

  return (
    <>
      <Sidebar
        locale={lang}
        dict={dict}
        hasCompany={hasCompany}
        leadsCount={leadsCount}
        user={currentUser}
        isAdmin={isAdmin}
      />
      <div className="main-with-sidebar">
        <Topbar locale={lang} dict={dict} user={currentUser} />
        {children}
      </div>
    </>
  );
}
