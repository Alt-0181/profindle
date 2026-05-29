import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';

export default async function DashboardHomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.dashboard;

  const DEMO_USER = { firstName: 'Somchai', email: 'somchai@jaidee.co.th', company: 'Jaidee Solutions Co., Ltd.' };
  const hasCompany = true;
  const stepsCompleted = 1;

  const kpis = [
    { label: t.profileViews, value: '—', delta: null },
    { label: t.broadcastsSent, value: '0', delta: t.broadcasts },
    { label: t.portfolioProjects, value: '0', delta: null },
    { label: t.verificationStatus, value: lang === 'th' ? 'ไม่ได้ยื่น' : 'Not submitted', delta: null },
  ];

  const gettingStartedSteps = [
    {
      num: 1,
      title: t.step1Title,
      desc: t.step1Desc,
      done: hasCompany,
      href: `/${lang}/my-company`,
    },
    {
      num: 2,
      title: t.step2Title,
      desc: t.step2Desc,
      done: false,
      href: `/${lang}/portfolio`,
    },
    {
      num: 3,
      title: t.step3Title,
      desc: t.step3Desc,
      done: false,
      href: `/${lang}/settings`,
      ctaLabel: lang === 'th' ? 'เชื่อมต่อ LINE' : 'Connect LINE',
      ctaVariant: 'line' as const,
    },
    {
      num: 4,
      title: t.step4Title,
      desc: t.step4Desc,
      done: false,
      href: `/${lang}/package`,
      ctaLabel: lang === 'th' ? 'รับสิทธิ์' : 'Claim Offer',
      ctaVariant: 'amber' as const,
    },
  ];

  const quickActions = [
    {
      id: 'find',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      iconBg: '#F0F9F9',
      title: t.findProviders,
      desc: t.findProvidersSub,
      href: `/${lang}/search-providers`,
      locked: !hasCompany,
    },
    {
      id: 'broadcast',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F77F00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      ),
      iconBg: '#FFF6EC',
      title: t.broadcastRequest,
      desc: t.broadcastRequestSub,
      href: `/${lang}/broadcast-request`,
      locked: !hasCompany,
    },
    {
      id: 'portfolio',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
        </svg>
      ),
      iconBg: '#F0F9F9',
      title: t.addPortfolio,
      desc: t.addPortfolioSub,
      href: `/${lang}/portfolio`,
      locked: !hasCompany,
    },
    {
      id: 'services',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
      iconBg: '#F0F9F9',
      title: t.manageServices,
      desc: t.manageServicesSub,
      href: `/${lang}/provider-overview`,
      locked: !hasCompany,
    },
  ];

  return (
    <div className="page-body" style={{ maxWidth: '1200px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0E1017 0%, #0F6F73 100%)',
        borderRadius: '20px', padding: '28px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px',
        position: 'relative', overflow: 'hidden', marginBottom: '24px',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 80% 50%, rgba(247,127,0,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 50%, rgba(43,190,197,0.12) 0%, transparent 55%)' }} />
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {lang === 'th' ? `ยินดีต้อนรับ, ${DEMO_USER.firstName} 👋` : `Welcome back, ${DEMO_USER.firstName} 👋`}
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px' }}>
            {lang === 'th' ? DEMO_USER.company : DEMO_USER.company} · {DEMO_USER.email}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '320px' }}>
            <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #2BBEC5, #F77F00)', borderRadius: '999px', width: `${(stepsCompleted / 4) * 100}%` }} />
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
              {stepsCompleted} {lang === 'th' ? 'จาก 4 ขั้นตอน' : 'of 4 steps done'}
            </span>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '12px', flexShrink: 0 }}>
          {[
            { val: '0', label: lang === 'th' ? 'การเข้าชม' : 'Views' },
            { val: 'Free', label: lang === 'th' ? 'แผน' : 'Plan' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '14px', padding: '14px 18px', textAlign: 'center', minWidth: '80px',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'white', lineHeight: 1 }}>{stat.val}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{
            background: 'white', borderRadius: '14px', padding: '18px 20px',
            border: '1px solid rgba(15,111,115,0.10)',
          }}>
            <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: '#C8CDD7' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '3px' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Getting Started */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>{t.gettingStarted}</div>
                  <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '1px' }}>{t.gettingStartedSub}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '120px', height: '5px', background: '#F0F9F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, #0F6F73, #F77F00)', borderRadius: '999px', width: '25%' }} />
                </div>
                <span style={{ fontSize: '12px', color: '#6B7385', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  1 / 4
                </span>
              </div>
            </div>
            {gettingStartedSteps.map((step, i) => (
              <div key={step.num} style={{ borderBottom: i < gettingStartedSteps.length - 1 ? '1px solid #F4F5F7' : undefined }}>
                <Link href={step.href} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', textDecoration: 'none', color: '#171A21', transition: 'background 150ms' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '999px', flexShrink: 0,
                    background: step.done ? '#0F6F73' : '#F0F9F9',
                    border: `1.5px solid ${step.done ? '#0F6F73' : '#D4EEEF'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step.done ? 'white' : '#0F6F73', fontSize: '11px', fontWeight: 700,
                  }}>
                    {step.done ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : step.num}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{step.title}</div>
                    <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '2px' }}>{step.desc}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8CDD7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21', marginBottom: '12px' }}>{t.quickActions}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {quickActions.map((qa) => (
                <Link
                  key={qa.id}
                  href={qa.href}
                  style={{
                    background: qa.locked ? '#FAFBFC' : 'white',
                    borderRadius: '14px', padding: '20px',
                    border: `1.5px solid ${qa.locked ? '#E4E7ED' : '#E4E7ED'}`,
                    textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '10px',
                    position: 'relative', overflow: 'hidden',
                    cursor: qa.locked ? 'not-allowed' : 'pointer',
                    transition: 'all 200ms',
                  }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: qa.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {qa.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: qa.locked ? '#9AA0AE' : '#171A21' }}>{qa.title}</div>
                    <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '2px', lineHeight: 1.5 }}>{qa.desc}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0F6F73', fontWeight: 600, marginTop: '4px' }}>
                    {lang === 'th' ? 'เปิด →' : 'Open →'}
                  </div>
                  {qa.locked && (
                    <div style={{
                      position: 'absolute', top: '14px', right: '14px',
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: 'white', border: '1px solid #E4E7ED', borderRadius: '999px',
                      padding: '3px 8px', fontSize: '10px', fontWeight: 600, color: '#6B7385',
                    }}>
                      🔒 {t.locked}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>{t.recentActivity}</span>
            </div>
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9AA0AE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#9AA0AE' }}>{t.noActivity}</div>
              <div style={{ fontSize: '12px', color: '#C8CDD7', marginTop: '4px', maxWidth: '280px', margin: '4px auto 0', lineHeight: 1.5 }}>{t.noActivitySub}</div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div>
          {/* LINE Nudge */}
          <div style={{
            background: 'linear-gradient(135deg, #04a544, #06C755)', borderRadius: '14px', padding: '16px 18px',
            display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px',
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 50 50" fill="white">
                <path d="M25 2C12.3 2 2 10.8 2 21.7c0 9.5 8.4 17.5 19.8 19.4.8.2 1.8.5 2.1 1.2.2.6.1 1.5 0 2.1l-.3 1.9c-.1.6-.5 2.4 2.1 1.3 2.6-1.1 14-8.2 19.1-14.1C48 30.1 48 26 48 21.7 48 10.8 37.7 2 25 2z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{t.lineNudgeTitle}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px', lineHeight: 1.5 }}>{t.lineNudgeSub}</div>
            </div>
            <Link href={`/${lang}/settings`} style={{
              marginLeft: 'auto', background: 'white', color: '#06C755', fontSize: '12px', fontWeight: 700,
              padding: '7px 14px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {t.connectLine}
            </Link>
          </div>

          {/* Profile completion ring */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #F4F5F7' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#171A21' }}>
                {lang === 'th' ? 'ความสมบูรณ์ของโปรไฟล์' : 'Profile Completeness'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="45" fill="none" stroke="#F0F9F9" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="45" fill="none"
                  stroke="url(#ring-grad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="212"
                />
                <defs>
                  <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0F6F73" />
                    <stop offset="100%" stopColor="#F77F00" />
                  </linearGradient>
                </defs>
                <text x="60" y="56" textAnchor="middle" dominantBaseline="middle" style={{ transform: 'rotate(90deg)', transformOrigin: '60px 60px' }}>
                  <tspan x="60" dy="-8" fontSize="22" fontWeight="700" fill="#171A21">25%</tspan>
                  <tspan x="60" dy="18" fontSize="11" fill="#9AA0AE">{lang === 'th' ? 'สมบูรณ์' : 'complete'}</tspan>
                </text>
              </svg>
            </div>
            <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: lang === 'th' ? 'ข้อมูลบริษัท' : 'Company profile', done: true },
                { label: lang === 'th' ? 'ผลงาน' : 'Portfolio', done: false },
                { label: lang === 'th' ? 'เชื่อมต่อ LINE' : 'LINE connected', done: false },
                { label: lang === 'th' ? 'ยืนยัน DBD' : 'DBD verified', done: false },
              ].map((step) => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: step.done ? '#0F6F73' : '#6B7385', fontWeight: step.done ? 500 : 400 }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '999px', background: step.done ? '#0F6F73' : '#C8CDD7', flexShrink: 0 }} />
                  {step.label}
                </div>
              ))}
            </div>
          </div>

          {/* Help card */}
          <div style={{
            background: 'linear-gradient(135deg, #F0F9F9, #D4EEEF)', borderRadius: '14px', padding: '22px',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F6F73' }}>{t.needHelp}</div>
            <p style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.55, margin: 0 }}>{t.helpText}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: '#06C755', color: 'white', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                {t.contactLine}
              </a>
              <a href="mailto:support@profindle.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'white', color: '#0F6F73', fontSize: '12px', fontWeight: 600, border: '1.5px solid rgba(15,111,115,0.2)', textDecoration: 'none' }}>
                {t.contactEmail}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
