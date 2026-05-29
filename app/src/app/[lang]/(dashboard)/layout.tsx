import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

const DEMO_USER = {
  initial: 'S',
  fullName: 'Somchai J.',
  firstName: 'Somchai',
  plan: 'free' as const,
  email: 'somchai@jaidee.co.th',
  company: {
    name: 'Jaidee Solutions Co., Ltd.',
    name_th: 'บริษัท ใจดี โซลูชั่นส์ จำกัด',
  },
};

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

  // In production, read from session/auth
  const hasCompany = true;

  return (
    <>
      <Sidebar
        locale={lang}
        dict={dict}
        hasCompany={hasCompany}
        user={DEMO_USER}
      />
      <div className="main-with-sidebar">
        <Topbar locale={lang} dict={dict} user={DEMO_USER} />
        {children}
      </div>
    </>
  );
}
