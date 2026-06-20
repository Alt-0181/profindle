import { notFound, redirect } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { createClient } from '@/lib/supabase/server';

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
    fullName: fullName.length > 20 ? firstName : fullName,
    firstName,
    plan: 'free' as const,
    email: user.email || '',
    company: null,
  };

  // In production, check if user has a linked company
  const hasCompany = false;

  return (
    <>
      <Sidebar
        locale={lang}
        dict={dict}
        hasCompany={hasCompany}
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
