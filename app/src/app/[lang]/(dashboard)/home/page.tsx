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

  const { count: premiumCount } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('premium', true);
  const earlyBirdTotal = 100;
  const earlyBirdLeft = Math.max(0, earlyBirdTotal - (premiumCount ?? 0));

  const { data: company } = await supabase
    .from('companies')
    .select('id, dbd_certificate_url, industry, line_user_id, verified, premium, views')
    .eq('user_id', user?.id ?? '')
    .maybeSingle();
  const hasCompany = !!company;
  const emailVerified = true;
  const lineConnected = !!(company as any)?.line_user_id;
  const companyVerified = !!(company as any)?.verified;
  const companyPremium = !!(company as any)?.premium;

  const profileViews = (company as any)?.views ?? 0;

  const { count: broadcastCount } = company
    ? await supabase
        .from('broadcasts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user?.id ?? '')
    : { count: 0 };

  const { count: portfolioCount } = company
    ? await supabase
        .from('portfolio_projects')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', company.id)
    : { count: 0 };
  const hasPortfolio = (portfolioCount ?? 0) > 0;
  const hasIndustry = !!company?.industry;
  const docsUploaded = !!company?.dbd_certificate_url;
  // Path format: {user_id}-{timestamp}.ext — extract just the extension for display
  const dbdCertPath = company?.dbd_certificate_url ?? null;
  const dbdFileExt = dbdCertPath ? dbdCertPath.split('.').pop()?.toUpperCase() : null;

  const completedSteps = [hasCompany, hasPortfolio, lineConnected, false /* early bird */].filter(Boolean).length;

  const gettingStartedSteps = [
    {
      num: 1,
      title: isTh ? 'กรอกข้อมูลโปรไฟล์ให้ครบ' : 'Complete your profile',
      desc: isTh ? 'เพิ่มบริการ คำอธิบาย และโลโก้ เพื่อปรากฏในการค้นหา' : 'Add services, description, and logo to appear in search.',
      done: hasCompany && emailVerified,
      status: `${[emailVerified, hasCompany, hasIndustry, docsUploaded].filter(Boolean).length} / 4`,
      buyerShortcut: hasCompany ? {
        text: isTh ? 'มองหาผู้ให้บริการ? เริ่มค้นหาได้เลย — ขั้นตอน 2-4 สำหรับผู้ให้บริการ' : 'Hiring only? You can start finding providers now — steps 2–4 are for service providers.',
        label: isTh ? 'ค้นหาผู้ให้บริการ →' : 'Find Providers →',
        href: `/${lang}/find-providers`,
      } : undefined,
      subTasks: [
        { title: isTh ? 'ยืนยันอีเมล' : 'Verify your email', sub: isTh ? `ยืนยันแล้วผ่าน ${userEmail}` : `Confirmed via ${userEmail}`, done: emailVerified, href: `/${lang}/settings` },
        { title: isTh ? 'เพิ่มข้อมูลบริษัทพื้นฐาน' : 'Add company basic info', sub: isTh ? 'ชื่อบริษัท อุตสาหกรรม และข้อมูลติดต่อ' : 'Company name, industry, and contact info', done: hasCompany, href: `/${lang}/my-company` },
        { title: isTh ? 'เลือกอุตสาหกรรมและบริการ' : 'Select your industry & services', sub: isTh ? 'ช่วยให้ลูกค้าค้นหาคุณเจอ' : 'Helps clients find you in search', done: hasIndustry, href: `/${lang}/my-company` },
        {
          title: isTh ? 'อัปโหลดเอกสารยืนยันตัวตน' : 'Upload verification documents',
          sub: docsUploaded
            ? (isTh ? `✓ อัปโหลดแล้ว — ไฟล์ ${dbdFileExt}` : `✓ Uploaded — ${dbdFileExt} file`)
            : (isTh ? 'รับ Verified badge บนโปรไฟล์' : 'Get the Verified badge on your profile'),
          done: docsUploaded,
          href: `/${lang}/my-company`,
        },
      ],
    },
    {
      num: 2,
      title: isTh ? 'เพิ่มผลงาน' : 'Add portfolio',
      desc: isTh ? 'สำหรับผู้ให้บริการ — นำเสนอผลงานจริงเพื่อสร้างความเชื่อมั่นกับลูกค้า' : 'For service providers — showcase real work to build trust with potential clients.',
      done: hasPortfolio,
      providerOnly: true,
      status: hasPortfolio
        ? (isTh ? `${portfolioCount} ผลงาน` : `${portfolioCount} project${portfolioCount === 1 ? '' : 's'}`)
        : (isTh ? 'ยังไม่ได้เริ่ม' : 'Not started'),
      bodyText: isTh ? 'เพิ่มอย่างน้อย 3 ผลงาน พร้อมรูปภาพ ผลลัพธ์ และบริการที่ส่งมอบ ผลงานที่ยืนยันแล้วจะปรากฏในการค้นหาสูงกว่า' : 'Add at least 3 projects with images, results, and the services delivered. Verified projects rank higher in client search.',
      ctaLabel: isTh ? 'เพิ่มผลงาน →' : 'Add a project →',
      ctaHref: `/${lang}/portfolio`,
      ctaStyle: 'teal' as const,
    },
    {
      num: 3,
      title: isTh ? 'เชื่อม LINE เพื่อรับการแจ้งเตือน' : 'Connect LINE for alerts',
      desc: isTh ? 'สำหรับผู้ให้บริการ — รับแจ้งเตือนทันทีเมื่อมีคำขอที่ตรงกับบริการของคุณ' : 'For service providers — get notified when buyers post requests matching your services.',
      done: lineConnected,
      providerOnly: true,
      status: lineConnected ? (isTh ? 'เชื่อมแล้ว' : 'Connected') : (isTh ? 'ยังไม่ได้เชื่อม' : 'Not connected'),
      bodyText: isTh ? 'ไม่พลาดทุกคำขอจากลูกค้า เชื่อมบัญชี LINE ครั้งเดียว เราจะแจ้งเตือนทุกคำขอที่ตรงกับบริการของคุณ หมายเหตุ: แนะนำให้ใช้บัญชี LINE ของบริษัท ไม่ใช่บัญชีส่วนตัว' : 'Never miss a client broadcast. Connect LINE once and we\'ll notify you on every matching request. Note: use a company LINE account, not a personal one — staff changes break personal connections.',
      ctaLabel: isTh ? 'เชื่อม LINE' : 'Connect LINE',
      ctaHref: `/${lang}/settings`,
      ctaStyle: 'line' as const,
    },
    {
      num: 4,
      title: isTh ? 'รับสิทธิ์ Early Bird' : 'Claim Early Bird offer',
      desc: isTh ? `รับฟีเจอร์ Premium ทั้งหมดฟรี — เหลือ ${earlyBirdLeft} จาก ${earlyBirdTotal} สิทธิ์` : `Get all Premium features FREE — ${earlyBirdLeft} of ${earlyBirdTotal} spots left.`,
      done: false,
      status: isTh ? 'จำกัด' : 'Limited',
      bodyText: isTh ? '100 บริษัทแรกบน Profindle จะได้รับฟีเจอร์ Premium ทั้งหมดฟรีตลอดชีพ เมื่อสิทธิ์หมด จะไม่มีอีก' : 'First 100 companies on Profindle get all Premium features free for life. Once spots are gone, they\'re gone.',
      ctaLabel: isTh ? 'รับสิทธิ์ →' : 'Claim now →',
      ctaHref: `/${lang}/package`,
      ctaStyle: 'amber' as const,
    },
  ];

  return (
    <div className="page-body">

      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg,#0E1017 0%,#0F6F73 100%)', borderRadius: '20px', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', position: 'relative', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 80% 50%,rgba(247,127,0,0.1) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 20% 50%,rgba(43,190,197,0.12) 0%,transparent 55%)' }} />
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {isTh ? `ยินดีต้อนรับกลับมา ${fullName} 👋` : `Welcome back, ${fullName} 👋`}
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
            { val: String(profileViews), label: isTh ? 'การเข้าชม' : 'Profile views' },
            { val: String(broadcastCount ?? 0), label: isTh ? 'กระจายข่าว' : 'Broadcasts' },
            { val: companyPremium ? (isTh ? 'พรีเมียม' : 'Premium') : (isTh ? 'ฟรี' : 'Free'), label: isTh ? 'แพ็กเกจปัจจุบัน' : 'Current plan', orange: true },
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
          { label: isTh ? 'ผลงาน' : 'Portfolio Projects', value: portfolioCount ?? 0, sub: portfolioCount ? (isTh ? `${portfolioCount} โปรเจคที่แสดง` : `${portfolioCount} project${portfolioCount === 1 ? '' : 's'} listed`) : (isTh ? 'ยังไม่มีผลงาน' : 'No projects added yet') },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(15,111,115,0.10)' }}>
            <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: '#171A21' }}>{kpi.value}</div>
            <div style={{ fontSize: '12px', color: '#6B7385', fontWeight: 600, marginTop: '4px' }}>{kpi.label}</div>
            <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '3px' }}>{kpi.sub}</div>
          </div>
        ))}
        {/* Verification Status — special badge card */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '18px 20px', border: `1px solid ${companyVerified ? 'rgba(15,111,115,0.20)' : docsUploaded ? 'rgba(247,127,0,0.25)' : 'rgba(15,111,115,0.10)'}` }}>
          {companyVerified ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#0F6F73,#1A9DA3)', borderRadius: '10px', padding: '6px 12px', marginBottom: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{isTh ? 'ยืนยันแล้ว' : 'Verified'}</span>
            </div>
          ) : docsUploaded ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(247,127,0,0.12)', borderRadius: '10px', padding: '6px 12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#E06B00' }}>⏳ {isTh ? 'รอตรวจสอบ' : 'Pending'}</span>
            </div>
          ) : (
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#C8CDD7', marginBottom: '8px' }}>—</div>
          )}
          <div style={{ fontSize: '12px', color: '#6B7385', fontWeight: 600 }}>{isTh ? 'สถานะการยืนยัน' : 'Verification Status'}</div>
          <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '3px' }}>
            {companyVerified ? (isTh ? 'โปรไฟล์ของคุณได้รับการยืนยัน' : 'Your profile is verified') : docsUploaded ? (isTh ? 'แอดมินกำลังตรวจสอบ' : 'Admin reviewing your docs') : (isTh ? 'อัปโหลดเอกสารเพื่อยืนยัน' : 'Upload docs to get verified')}
          </div>
        </div>
      </div>

      {/* Getting Started — full width */}
      <div style={{ marginBottom: '20px' }}>
        <GettingStartedAccordion steps={gettingStartedSteps} lang={lang} completedCount={completedSteps} />
      </div>

      {/* Row 2: Recent Activity (left) | Need Help (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', alignItems: 'start' }}>
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
