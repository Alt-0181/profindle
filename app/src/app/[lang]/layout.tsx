import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from '@/dictionaries';

export const metadata: Metadata = {
  title: 'Profindle — Find Verified B2B Service Providers in Thailand',
  description: 'Connect with verified Thai service providers. Post a broadcast request, get matched instantly via LINE.',
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'th' }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
