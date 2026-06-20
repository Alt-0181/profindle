import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { GettingStartedAccordion } from './getting-started';

export default async function DashboardHomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.dashboard;
  const isTh = lang === 'th';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName: string = user?.user_metadata?.full_name || user?.email || 'User';
  const firstName = fullName.split(' ')[0];
  const userEmail = user?.email || '';

  const hasCompany = false;
  const emailVerified = true;
  const hasPortfolio = false;
  const lineConnected = false;
  const docsUploaded = false;

  const completedSteps = [hasCompany, hasPortfolio, lineConnected, false].filter(Boolean).length;

  const gettingStartedSteps = [
    {
      num: 1,
      title: isTh ? 'กรอกข้อมูลโปรไฟล์ให้ครบ' : 'Complete your profile',
      desc: isTh ? 'เพิ่มบริการ คำอธิบาย และโลโก้ เพื่อปรากฏในการค้นหา' : 'Add services, description, and logo to appear in search.',
      done: hasCompany && emailVerified,
      status: `${[emailVerified, hasCompany, false, false].filter(Boolean).length} / 4`,
      subTasks: [
        { title: isTh ? 'ยืนยันอีเมล' : 'Verify your email', sub: isTh ? `ยืนยันแล้วผ่าน ${userEmail}` : `Confirmed via ${userEmail}`, done: emailVerified, href: `/${lang}/settings` },
        { title: isTh ? 'เพิ่มข้อมูลบริษัทพื้นฐาน' : 'Add company basic info', sub: isTh ? 'ชื่อบริษัท อุตสาหกรรม และข้อมูลติดต่อ' : 'Company name, industry, and contact info', done: hasCompany, href: `/${lang}/my-company` },
        { title: isTh ? 'เลือกอุตสาหกรรมและบริการ' : 'Select your industry & services', sub: isTh ? 'ช่วยให้ลูกค้าค้นหาคุณเจอ' : 'Helps clients find you in search', done: false, href: `/${lang}/my-company` },
        { title: isTh ? 'อัปโหลดเอกสารยืนยันตัวตน' : 'Upload verification documents', sub: isTh ? 'รับ Verified badge บนโปรไฟล์' : 'Get the Verified badge on your profile', done: docsUploaded, href: `/${lang}/my-company` },
      ],
    },
    {
      num: 2,
      title: isTh ? 'เพิ่มผลงาน' : 'Add portfolio',
      desc: isTh ? 'นำเสนอผลงานจริงเพื่อสร้างความเชื่อมั่นกับลูกค้า' : 'Showcase real work to build trust with potential clients.',
      done: hasPortfolio,
      status: isTh ? 'ยังไม่ได้เริ่ม' : 'Not started',
      bodyText: isTh ? 'เพิ่มอย่างน้อย 3 ผลงาน พร้อมรูปภาพ ผลลัพธ์ และบริการที่ส่งมอบ ผลงานที่ยืนยันแล้วจะปรากฏในการค้นหาสูงกว่า' : 'Add at least 3 projects with images, results, and the services delivered. Verified projects rank higher in client search.',
      ctaLabel: isTh ? 'เพิ่มผลงาน →' : 'Add a project →',
      ctaHref: `/${lang}/portfolio`,
      ctaStyle: 'teal' as const,
    },
    {
      num: 3,
      title: isTh ? 'เชื่อม LINE เพื่อรับการแจ้งเตือน' : 'Connect LINE for alerts',
      desc: isTh ? 'รับการแจ้งเตือนทันทีเมื่อลูกค้าโพสต์คำขอ' : 'Get instant broadcast alerts the moment a client posts a request.',
      done: lineConnected,
      status: isTh ? 'ยังไม่ได้เชื่อม' : 'Not connected',
      bodyText: isTh ? 'ไม่พลาดทุกคำขอจากลูกค้า เชื่อมบัญชี LINE ครั้งเดียว เราจะแจ้งเตือนทุกคำขอที่ตรงกับคุณ' : 'Never miss a client broadcast. Connect your LINE account once and we\'ll notify you on every matching request.',
      ctaLabel: isTh ? 'เชื่อม LINE' : 'Connect LINE',
      ctaHref: `/${lang}/settings`,
      ctaStyle: 'line' as const,
    },
    {
      num: 4,
      title: isTh ? 'รับสิทธิ์ Early Bird' : 'Claim Early Bird offer',
      desc: isTh ? 'รับฟีเจอร์ Premium ทั้งหมดฟรี — เหลือ 47 จาก 100 สิทธิ์' : 'Get all Premium features FREE — 47 of 100 spots left.',
      done: false,
      status: isTh ? 'จำกัด' : 'Limited',
      bodyText: isTh ? '100 บริษัทแรกบน Profindle จะได้รับฟีเจอร์ Premium ทั้งหมดฟรีตลอดชีพ เมื่อสิทธิ์หมด จะไม่มีอีก' : 'First 100 companies on Profindle get all Premium features free for life. Once spots are gone, they\'re gone.',
      ctaLabel: isTh ? 'รับสิทธิ์ →' : 'Claim now →',
      ctaHref: `/${lang}/package`,
      ctaStyle: 'amber' as const,
    },
  ];

  const quickActions = [
    {
      id: 'services',
      iconBg: 'linear-gradient(135deg,#0F6F73,#1A9DA3)',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
      title: isTh ? 'จัดการบริการ' : 'Manage Services',
      desc: isTh ? 'ตั้งค่าบริการของคุณเพื่อดึงดูดลูกค้าใหม่' : 'Set up your service offerings and attract new clients.',
      cta: isTh ? 'ดูภาพรวม →' : 'View overview →',
      href: `/${lang}/provider-overview`,
      locked: !hasCompany,
    },
    {
      id: 'find',
      iconBg: 'linear-gradient(135deg,#F77F00,#E06B00)',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
      title: isTh ? 'ค้นหาผู้ให้บริการ' : 'Find Providers',
      desc: isTh ? 'ค้นหาหรือกระจายคำขอไปยังผู้ให้บริการที่ตรงกัน' : 'Search or broadcast a request to matching providers.',
      cta: isTh ? 'ค้นหาเลย →' : 'Search now →',
      href: `/${lang}/find-providers`,
      locked: !hasCompany,
    },
    {
      id: 'portfolio',
      iconBg: 'linear-gradient(135deg,#2BBEC5,#0F6F73)',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>,
      title: isTh ? 'เพิ่มผลงาน' : 'Add Portfolio',
      desc: isTh ? 'นำเสนอผลงานเพื่อสร้างความเชื่อมั่น' : 'Showcase projects to build trust with potential clients.',
      cta: isTh ? 'เพิ่มผลงาน →' : 'Add project →',
      href: `/${lang}/portfolio`,
      locked: !hasCompany,
    },
    {
      id: 'earlybird',
      iconBg: 'linear-gradient(135deg,#F77F00,#E06B00)',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
      title: isTh ? 'สิทธิ์ Early Bird' : 'Early Bird Offer',
      desc: isTh ? 'รับฟีเจอร์ Premium ทั้งหมดฟรี — เหลือ 47 จาก 100 สิทธิ์' : 'Get all Premium features FREE — 47 of 100 spots left.',
      cta: isTh ? 'รับสิทธิ์ →' : 'Claim now →',
      href: `/${lang}/package`,
      locked: false,
      special: true,
    },
  ];

  return (
    <div className="page-body" style={{ maxWidth: '1200px' }}>

      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg,#0E1017 0%,#0F6F73 100%)', borderRadius: '20px', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 80% 50%,rgba(247,127,0,0.1) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 20% 50%,rgba(43,190,197,0.12) 0%,transparent 55%)' }} />
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {isTh ? `ยินดีต้อนรับกลับมา ${firstName} 👋` : `Welcome back, ${firstName} 👋`}
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px' }}>
            {isTh ? 'กรอกข้อมูลโปรไฟล์ให้ครบเพื่อปลดล็อกทุกฟีเจอร์' : 'Complete your profile to unlock all platform features.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '320px' }}>
            <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#2BBEC5,#F77F00)', borderRadius: '999px', width: `${(completedSteps / 4) * 100}%` }} />
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
              {completedSteps} {isTh ? 'จาก 4 ขั้นตอน' : 'of 4 steps done'}
            </span>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '12px', flexShrink: 0 }}>
          {[
            { val: '0', label: isTh ? 'การเข้าชม' : 'Profile views' },
            { val: '0', label: isTh ? 'กระจายข่าว' : 'Broadcasts' },
            { val: isTh ? 'ฟรี' : 'Free', label: isTh ? 'แพ็กเกจปัจจุบัน' : 'Current plan', orange: true },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px 18px', textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: stat.orange ? '#F77F00' : 'white', lineHeight: 1 }}>{stat.val}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gate banner — shown when no company */}
      {!hasCompany && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', border: '1.5px solid rgba(15,111,115,0.15)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21' }}>
              {isTh ? 'เพิ่มข้อมูลบริษัทเพื่อปลดล็อกฟีเจอร์' : 'Add your company info to unlock provider & buyer features'}
            </div>
            <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '2px' }}>
              {isTh ? 'จัดการบริการ ผลงาน เชื่อม LINE และค้นหาผู้ให้บริการต้องมีบริษัทก่อน' : 'Manage Services, Portfolio, LINE Connect and Find Providers all need a company profile.'}
            </div>
          </div>
          <Link href={`/${lang}/my-company`} style={{ background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', color: 'white', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {isTh ? 'เพิ่มข้อมูลบริษัท →' : 'Add company info →'}
          </Link>
        </div>
      )}

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: isTh ? 'การเข้าชมโปรไฟล์' : 'Profile Views', value: '—', sub: isTh ? 'ข้อมูลจะแสดงเมื่อมีการเข้าชมครั้งแรก' : 'Data appears after your first profile view' },
          { label: isTh ? 'คำขอกระจายข่าวที่ส่ง' : 'Broadcast Requests Sent', value: '—', sub: isTh ? 'ฟรี 4 ครั้ง/เดือน' : '4 free broadcasts/month' },
          { label: isTh ? 'ผลงาน' : 'Portfolio Projects', value: '—', sub: isTh ? 'ยังไม่มีผลงาน' : 'No projects added yet' },
          { label: isTh ? 'สถานะการยืนยัน' : 'Verification Status', value: '—', sub: isTh ? '⚠ รอตรวจสอบเอกสาร' : '⚠ Documents pending', warn: true },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(15,111,115,0.10)' }}>
            <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: '#C8CDD7' }}>{kpi.value}</div>
            <div style={{ fontSize: '12px', color: '#6B7385', fontWeight: 600, marginTop: '4px' }}>{kpi.label}</div>
            <div style={{ fontSize: '12px', color: kpi.warn ? '#E06B00' : '#9AA0AE', marginTop: '3px' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Getting Started (left) | Quick Actions (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start', marginBottom: '20px' }}>
        {/* Left: Getting Started accordion */}
        <GettingStartedAccordion steps={gettingStartedSteps} lang={lang} completedCount={completedSteps} />

        {/* Right: Quick Actions */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA0AE', marginBottom: '10px' }}>
            {isTh ? 'การดำเนินการด่วน' : 'Quick Actions'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {quickActions.map((qa) => (
              <Link key={qa.id} href={qa.locked ? `/${lang}/my-company?from=locked` : qa.href} style={{
                background: qa.special ? 'linear-gradient(135deg,#FFFBF5,#FFF8EE)' : qa.locked ? '#FAFBFC' : 'white',
                borderRadius: '14px', padding: '20px',
                border: `1.5px solid ${qa.special ? 'rgba(247,127,0,0.3)' : '#E4E7ED'}`,
                textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '10px',
                position: 'relative', overflow: 'hidden', transition: 'all 200ms',
              }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: qa.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {qa.icon}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: qa.special ? '#E06B00' : qa.locked ? '#9AA0AE' : '#171A21' }}>{qa.title}</div>
                <div style={{ fontSize: '12px', color: qa.special ? '#F77F00' : '#9AA0AE', lineHeight: 1.5 }}>{qa.desc}</div>
                <div style={{ fontSize: '12px', color: qa.special ? '#F77F00' : '#0F6F73', fontWeight: 600, marginTop: '4px' }}>{qa.cta}</div>
                {qa.locked && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'white', border: '1px solid #E4E7ED', borderRadius: '999px', padding: '3px 8px', fontSize: '10px', fontWeight: 600, color: '#6B7385' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    {isTh ? 'ล็อก' : 'Locked'}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Recent Activity (left) | Need Help (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Recent Activity */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>{isTh ? 'กิจกรรมล่าสุด' : 'Recent Activity'}</span>
            <span style={{ fontSize: '12px', color: '#9AA0AE' }}>{isTh ? '7 วันล่าสุด' : 'Last 7 days'}</span>
          </div>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#0F6F73', flexShrink: 0, marginTop: '5px' }} />
            <div style={{ fontSize: '13px', color: '#444B5A', flex: 1, lineHeight: 1.5 }}>
              {isTh ? 'สร้างบัญชีแล้ว — ยินดีต้อนรับสู่ Profindle!' : 'Account created — welcome to Profindle!'}
            </div>
            <div style={{ fontSize: '11px', color: '#9AA0AE', flexShrink: 0, marginTop: '2px' }}>{isTh ? 'วันนี้' : 'Today'}</div>
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#FAFCFC' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#C8CDD7', flexShrink: 0, marginTop: '5px' }} />
            <div style={{ fontSize: '13px', color: '#9AA0AE', flex: 1, lineHeight: 1.5 }}>
              {isTh ? 'กิจกรรมจะแสดงที่นี่เมื่อคุณเริ่มใช้งาน Profindle' : 'Activity will appear here as you use Profindle.'}
            </div>
            <div style={{ fontSize: '11px', color: '#9AA0AE' }}>—</div>
          </div>
        </div>

        {/* Need Help */}
        <div style={{ background: 'linear-gradient(135deg,#F0F9F9,#D4EEEF)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F6F73' }}>{isTh ? 'ต้องการความช่วยเหลือ?' : 'Need help?'}</div>
          <p style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.55, margin: 0 }}>
            {isTh ? 'ทีมงานพร้อมช่วยคุณตั้งค่าบน Profindle ติดต่อเราได้ตลอดทาง LINE — ตอบกลับภายใน 1 ชั่วโมง' : 'Our team is ready to assist you get set up on Profindle. Reach out anytime on LINE — we usually reply within an hour.'}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            <a href="https://lin.ee/VjYhQQ0" target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: '#06C755', color: 'white', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.92 3.38C1.86 2.58 2.42 2 3.22 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.15 6.15l1.48-1.48a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              {isTh ? 'ติดต่อทาง LINE' : 'Contact on LINE'}
            </a>
            <a href="mailto:support@profindle.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'white', color: '#0F6F73', fontSize: '12px', fontWeight: 600, border: '1.5px solid rgba(15,111,115,0.2)', textDecoration: 'none' }}>
              {isTh ? 'อีเมลเรา' : 'Email us'}
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
