import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import Link from 'next/link';

export default async function FindProvidersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.findProviders;

  const popularServices = [
    { name: lang === 'th' ? 'ออกแบบแบรนด์' : 'Brand Design', icon: '🎨' },
    { name: lang === 'th' ? 'พัฒนาเว็บ' : 'Web Development', icon: '💻' },
    { name: lang === 'th' ? 'การตลาดดิจิทัล' : 'Digital Marketing', icon: '📣' },
    { name: lang === 'th' ? 'SEO' : 'SEO', icon: '🔍' },
    { name: lang === 'th' ? 'ถ่ายภาพ' : 'Photography', icon: '📷' },
    { name: lang === 'th' ? 'วิดีโอ' : 'Video Production', icon: '🎬' },
    { name: lang === 'th' ? 'การบัญชี' : 'Accounting', icon: '📊' },
    { name: lang === 'th' ? 'ที่ปรึกษา' : 'Consulting', icon: '🤝' },
  ];

  return (
    <div className="page-body">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0B2B2C 0%, #0F6F73 100%)', borderRadius: '20px', padding: '48px 40px', marginBottom: '32px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(247,127,0,0.12)', filter: 'blur(48px)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(26,157,163,0.2)', filter: 'blur(36px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '12px' }}>{t.title}</h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>{t.subtitle}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/${lang}/broadcast-request`} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #F77F00, #FFB347)', color: 'white', fontWeight: 700, fontSize: '15px', borderRadius: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
              {t.broadcastBtn}
            </Link>
            <Link href={`/${lang}/search-providers`} style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 600, fontSize: '15px', borderRadius: '12px', textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
              {t.searchProviders}
            </Link>
          </div>
        </div>
      </div>

      {/* Popular services */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '16px' }}>
          {lang === 'th' ? 'บริการยอดนิยม' : 'Popular Services'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {popularServices.map((svc) => (
            <Link
              key={svc.name}
              href={`/${lang}/search-providers`}
              style={{ background: 'white', borderRadius: '14px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', textDecoration: 'none', transition: 'all 150ms' }}
            >
              <span style={{ fontSize: '28px' }}>{svc.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#171A21', textAlign: 'center' }}>{svc.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* How broadcast works */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '28px 32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '24px' }}>
          {lang === 'th' ? 'วิธีการทำงานของ Broadcast' : 'How Broadcast Works'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {[
            { step: '1', title: lang === 'th' ? 'อธิบายงานของคุณ' : 'Describe your project', desc: lang === 'th' ? 'บอกเราว่าคุณต้องการอะไรและงบประมาณคือเท่าไร' : 'Tell us what you need and your budget range.' },
            { step: '2', title: lang === 'th' ? 'รับข้อเสนอ' : 'Receive proposals', desc: lang === 'th' ? 'ผู้ให้บริการที่ตรงกับคุณจะส่งข้อเสนอมาให้' : 'Matched providers send you their best proposals.' },
            { step: '3', title: lang === 'th' ? 'เลือกคู่ที่เหมาะ' : 'Choose your match', desc: lang === 'th' ? 'เปรียบเทียบและตัดสินใจในเวลาของคุณเอง' : 'Compare and decide at your own pace.' },
          ].map((step) => (
            <div key={step.step} style={{ display: 'flex', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                {step.step}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{step.title}</div>
                <div style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
