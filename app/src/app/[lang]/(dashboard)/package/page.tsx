import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { EarlyBirdButton } from './early-bird-button';

export default async function PackagePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.package;

  const freeFeatures = [t.freeFeature1, t.freeFeature2, t.freeFeature3, t.freeFeature4];
  const premFeatures = [t.premFeature1, t.premFeature2, t.premFeature3, t.premFeature4, t.premFeature5, t.premFeature6];

  return (
    <div className="page-body">
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>{t.title}</h1>
        <p style={{ fontSize: '15px', color: '#6B7385' }}>{t.subtitle}</p>
      </div>

      {/* Free plan notice */}
      <div style={{ background: '#F4F5F7', border: '1px solid #E4E7ED', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ fontSize: '13px', color: '#6B7385' }}>
          {lang === 'th'
            ? '📋 คุณอยู่ใน แผนฟรี — ฟีเจอร์บางส่วนถูกจำกัดสำหรับสมาชิก Premium เท่านั้น'
            : '📋 You\'re on the Free plan — some features are limited to Premium members only'}
        </span>
      </div>

      {/* Early Bird Banner */}
      <div style={{ background: 'linear-gradient(135deg, #FFF8EE, #FFFBF5)', border: '1.5px solid rgba(247,127,0,0.3)', borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #F77F00, #FFB347)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#E06B00' }}>{t.earlyBirdBanner}</span>
        </div>
        <EarlyBirdButton
          label={t.claimBtn}
          style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #F77F00, #FFB347)', color: 'white', fontWeight: 700, fontSize: '13px', borderRadius: '10px', whiteSpace: 'nowrap' }}
        />
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '760px', margin: '0 auto' }}>
        {/* Free */}
        <div style={{ background: 'white', borderRadius: '20px', border: '2px solid #E4E7ED', padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{t.freeTier}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '40px', fontWeight: 800, color: '#171A21', letterSpacing: '-0.03em' }}>฿0</span>
              <span style={{ fontSize: '14px', color: '#9AA0AE' }}>{lang === 'th' ? '/เดือน' : '/month'}</span>
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {freeFeatures.map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#444B5A' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {f}
              </li>
            ))}
          </ul>

          <div style={{ padding: '12px', background: '#F0F9F9', borderRadius: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#0F6F73' }}>
            {t.currentPlan}
          </div>
        </div>

        {/* Premium */}
        <div style={{ background: 'linear-gradient(150deg, #0B2B2C 0%, #0F4447 50%, #0F6F73 100%)', borderRadius: '20px', border: '2px solid rgba(247,127,0,0.4)', padding: '32px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(247,127,0,0.12)', filter: 'blur(30px)' }} />
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.premiumTier}</span>
              <span style={{ padding: '2px 8px', background: 'linear-gradient(135deg, #F77F00, #FFB347)', borderRadius: '999px', fontSize: '10px', fontWeight: 800, color: 'white' }}>EARLY BIRD</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '40px', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', textDecoration: 'line-through', opacity: 0.4 }}>฿990</span>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#F77F00', letterSpacing: '-0.03em' }}>{lang === 'th' ? 'ฟรี' : 'FREE'}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>until Dec 31, 2026</div>
              </div>
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, position: 'relative', zIndex: 1 }}>
            {premFeatures.map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(247,127,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F77F00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {f}
              </li>
            ))}
          </ul>

          <EarlyBirdButton
            label={t.claimBtn}
            style={{ padding: '14px', background: 'linear-gradient(135deg, #F77F00, #FFB347)', color: 'white', fontWeight: 700, fontSize: '15px', borderRadius: '12px', position: 'relative', zIndex: 1, width: '100%', textAlign: 'center' }}
          />
        </div>
      </div>

      {/* FAQ / note */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: '#9AA0AE' }}>
          {lang === 'th' ? 'ยกเลิกได้ทุกเมื่อ ไม่มีบัตรเครดิต • สนับสนุนโดย Profindle' : 'Cancel anytime. No credit card required • Powered by Profindle'}
        </p>
      </div>
    </div>
  );
}
