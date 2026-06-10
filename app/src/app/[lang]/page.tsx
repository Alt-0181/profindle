import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { PublicNav } from '@/components/layout/public-nav';

export default async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.landing;
  const nav = dict.nav;

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", margin: 0, padding: 0 }}>
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
          <div style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '6px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 4px 16px rgba(15,111,115,0.15)',
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto',
          }}>
            {/* Service Type field */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '13px 16px', borderBottom: '1px solid #F0F0F0', position: 'relative' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#171A21', display: 'block', marginBottom: '3px', textAlign: 'left' }}>
                  {lang === 'th' ? 'ประเภทบริการ' : 'Service Type'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'th' ? 'จัดอีเวนต์, การตลาด, ออกแบบ…' : 'Event Planning, Marketing, Design…'}
                  style={{ width: '100%', fontSize: '13px', color: '#444B5A', border: 'none', outline: 'none', background: 'transparent', caretColor: '#0F6F73', fontFamily: 'inherit', textAlign: 'left' }}
                />
              </div>
            </div>
            {/* Additional Information field */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '13px 16px' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#171A21', display: 'block', marginBottom: '3px', textAlign: 'left' }}>
                  <span>{lang === 'th' ? 'ข้อมูลเพิ่มเติม' : 'Additional Information'}</span>
                  {' '}<span style={{ color: '#9AA0AE', fontWeight: 400 }}>{lang === 'th' ? '(ไม่บังคับ)' : '(Optional)'}</span>
                </label>
                <input
                  type="text"
                  placeholder={lang === 'th' ? 'กรุงเทพฯ, CentralWorld, ABC Corporation…' : 'Bangkok, CentralWorld, ABC Corporation…'}
                  style={{ width: '100%', fontSize: '13px', color: '#444B5A', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', textAlign: 'left' }}
                />
              </div>
            </div>
            {/* Search button */}
            <Link
              href={`/${lang}/search-providers`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '13px',
                background: 'linear-gradient(135deg, #0F6F73 0%, #1A9DA3 100%)',
                color: 'white', fontWeight: 600, fontSize: '15px',
                borderRadius: '14px', textAlign: 'center',
                boxShadow: '0 2px 8px rgba(15,111,115,0.25)',
                textDecoration: 'none', cursor: 'pointer', transition: 'all 150ms',
                boxSizing: 'border-box',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              {lang === 'th' ? 'ค้นหาผู้ให้บริการ' : 'Search Providers'}
            </Link>
          </div>

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

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px',
          maxWidth: '780px', width: '100%',
        }}>
          {/* Buyers Card */}
          <div style={{
            borderRadius: '20px', padding: '32px',
            background: '#F0F9F9', border: '1px solid rgba(15,111,115,0.12)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#171A21' }}>{t.forBuyersTitle}</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              {[t.buyerFeature1, t.buyerFeature2, t.buyerFeature3, t.buyerFeature4].map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#444B5A', lineHeight: 1.55 }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '999px', flexShrink: 0, marginTop: '2px',
                    border: '1.5px solid #0F6F73', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {feat}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '28px' }}>
              <Link href={`/${lang}/signup`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white',
                textDecoration: 'none',
              }}>
                {t.getStartedFree}
              </Link>
            </div>
          </div>

          {/* Providers Card */}
          <div style={{
            borderRadius: '20px', padding: '32px',
            background: 'linear-gradient(135deg, #171A21 0%, #0F6F73 100%)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>{t.forProvidersTitle}</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              {[t.providerFeature1, t.providerFeature2, t.providerFeature3, t.providerFeature4].map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '999px', flexShrink: 0, marginTop: '2px',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {feat}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '28px' }}>
              <Link href={`/${lang}/signup`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                background: 'rgba(255,255,255,0.15)', color: 'white',
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)',
              }}>
                {t.viewAllProviders}
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
