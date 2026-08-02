import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { PublicNav } from '@/components/layout/public-nav';
import { SearchCard } from './search-card';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://profindle.com';

// Hidden 2026-08 until we have enough provider data. "AI" branding set a chatbot
// expectation the card-search doesn't meet. The /ai-search route is kept intact;
// set this to `true` to bring the landing-page entry point back.
const SHOW_AI_SEARCH_ENTRY = false;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isTh = lang === 'th';
  return {
    title: isTh ? 'Profindle — ตลาด B2B ของไทย' : 'Profindle — Thailand B2B Service Marketplace',
    description: isTh
      ? 'ค้นหาผู้ให้บริการ B2B ในไทยที่ผ่านการยืนยัน — ดิจิทัลมาร์เก็ตติ้ง, IT, กฎหมาย, อีเว้นท์ และอื่นๆ ฟรี ไม่ต้องใช้บัตรเครดิต'
      : 'Find verified B2B service providers across Thailand — Digital Marketing, IT, Legal, Events and more. Free, no credit card required.',
    alternates: {
      canonical: `${siteUrl}/${lang}`,
      languages: { en: `${siteUrl}/en`, th: `${siteUrl}/th`, 'x-default': `${siteUrl}/en` },
    },
  };
}

export default async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.landing;
  const nav = dict.nav;

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", margin: 0, padding: 0 }}>
      <style>{`
        @media (max-width: 768px) {
          .how-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <PublicNav locale={lang} dict={dict} dark />

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(140deg, #0E1017 0%, #0F6F73 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Radial gradient accents */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(26,157,163,0.15) 0%, transparent 60%), radial-gradient(ellipse 40% 35% at 80% 60%, rgba(247,127,0,0.08) 0%, transparent 55%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '640px', width: '100%' }}>
          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(64px, 10vw, 104px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: 'white',
            margin: '0 0 16px',
          }}>
            {t.heroTitle.replace('.', '')}<span style={{ color: '#F77F00' }}>.</span>
          </h1>

          <p style={{ fontSize: '18px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', marginBottom: '8px' }}>
            {t.heroSub}
          </p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#2BBEC5', marginBottom: '40px' }}>
            {t.heroTagline}
          </p>

          {/* Search Card */}
          <SearchCard lang={lang} />

          {/* AI Search entry — gated by SHOW_AI_SEARCH_ENTRY (see flag near top of file). */}
          {SHOW_AI_SEARCH_ENTRY && (
          <div style={{ marginTop: '18px' }}>
            <Link href={`/${lang}/ai-search`} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(43,190,197,0.35)',
              color: 'white', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ color: '#F77F00', fontSize: '15px' }}>✦</span>
              {lang === 'th' ? 'ลองค้นหาด้วย AI' : 'Try AI Search'}
              <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em', color: '#2BBEC5', border: '1px solid rgba(43,190,197,0.5)', borderRadius: '999px', padding: '1px 6px' }}>BETA</span>
            </Link>
          </div>
          )}

          {/* How it works toggle */}
          <div style={{ marginTop: '24px' }}>
            <details style={{ textAlign: 'center' }}>
              <summary style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer', listStyle: 'none', transition: 'color 150ms',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {t.howToggle}
              </summary>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
                padding: '36px 0 8px', maxWidth: '620px', margin: '0 auto',
              }}>
                {[
                  { num: '1', title: t.step1Title, desc: t.step1Desc },
                  { num: '2', title: t.step2Title, desc: t.step2Desc },
                  { num: '3', title: t.step3Title, desc: t.step3Desc },
                ].map((step) => (
                  <div key={step.num} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '999px',
                      background: 'rgba(255,255,255,0.12)',
                      border: '1.5px solid rgba(43,190,197,0.4)',
                      color: '#2BBEC5', fontSize: '14px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}>
                      {step.num}
                    </div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>
                      {step.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        background: 'white', padding: '80px 48px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0F6F73', marginBottom: '14px' }}>
          {t.featuresLabel}
        </div>
        <h2 style={{
          fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em',
          color: '#171A21', marginBottom: '48px', textAlign: 'center',
        }}>
          {t.featuresTitle}
        </h2>

        <div className="features-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px',
          maxWidth: '780px', width: '100%',
        }}>
          {/* For Clients Card */}
          <div style={{ borderRadius: '20px', padding: '32px', background: '#F0F9F9', border: '1px solid rgba(15,111,115,0.12)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2.2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#171A21' }}>{lang === 'th' ? 'สำหรับลูกค้า' : 'For Clients'}</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              {(lang === 'th' ? [
                'ค้นหาผู้ให้บริการได้ง่ายด้วยตัวกรองอัจฉริยะ',
                'ประกาศคำขอ — ผู้ให้บริการทุกรายที่ตรงกับจะได้รับแจ้งผ่าน LINE ทันที',
                'ฟรี 100% สำหรับลูกค้า — ไม่มีค่าใช้จ่ายแอบแฝง',
              ] : [
                'Search service providers easily with smart filters',
                'Broadcast your request — every matching provider gets pinged on LINE instantly',
                '100% free for clients — no hidden fees',
              ]).map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#444B5A', lineHeight: 1.55 }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '999px', flexShrink: 0, marginTop: '2px', border: '1.5px solid #0F6F73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  {feat}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '28px' }}>
              <Link href={`/${lang}/search-providers`} style={{ display: 'inline-flex', alignItems: 'center', padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: '1.5px solid #0F6F73', color: '#0F6F73', textDecoration: 'none', background: 'transparent' }}>
                {lang === 'th' ? 'ค้นหาผู้ให้บริการ →' : 'Find providers →'}
              </Link>
            </div>
          </div>

          {/* For Service Providers Card */}
          <div style={{ borderRadius: '20px', padding: '32px', background: 'linear-gradient(135deg, #0B2B2C 0%, #0F6F73 100%)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>{lang === 'th' ? 'สำหรับผู้ให้บริการ' : 'For Service Providers'}</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              {(lang === 'th' ? [
                'ลงประกาศฟรี — นำเสนอธุรกิจของคุณได้โดยไม่มีค่าใช้จ่าย',
                'รับการแจ้งเตือน LINE ทันทีเมื่อลูกค้าค้นหาบริการของคุณ',
                'ถูกค้นพบโดยลูกค้าที่กำลังมองหาสิ่งที่คุณเสนอ',
              ] : [
                'Free listing — showcase your business at no cost',
                'Receive instant LINE notifications when clients search for your services',
                'Get discovered by more clients actively searching for what you offer',
              ]).map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '999px', flexShrink: 0, marginTop: '2px', border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  {feat}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '28px' }}>
              <Link href={`/${lang}/signup`} style={{ display: 'inline-flex', alignItems: 'center', padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}>
                {lang === 'th' ? 'สมัครฟรี →' : 'Join free →'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'white', padding: '20px 48px',
        borderTop: '1px solid #F0F0F0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href={`/${lang}/privacy`} style={{ fontSize: '12px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none' }}>
            {t.privacy}
          </Link>
          <Link href={`/${lang}/terms`} style={{ fontSize: '12px', fontWeight: 600, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none' }}>
            {t.terms}
          </Link>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#C8CDD7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {t.footerCopy}
        </span>
      </footer>
    </div>
  );
}
