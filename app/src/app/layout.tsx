import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { PageViewTracker } from './pageview-tracker';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://profindle.com'),
  title: {
    template: '%s | Profindle',
    default: 'Profindle — Thailand B2B Service Marketplace',
  },
  description: 'Find verified B2B service providers across Thailand — Digital Marketing, IT, Legal, Events and more. Free, no credit card required.',
  keywords: ['B2B', 'Thailand', 'service providers', 'marketplace', 'ผู้ให้บริการ', 'ไทย'],
  icons: {
    icon: [
      { url: '/assets/logo-mark.svg?v=2', type: 'image/svg+xml' },
      { url: '/assets/logo-mark.png?v=2', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/assets/logo-mark.png?v=2',
    apple: '/assets/logo-square.png?v=2',
  },
  openGraph: {
    siteName: 'Profindle',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <Analytics />
        <PageViewTracker />
      </body>
    </html>
  );
}
