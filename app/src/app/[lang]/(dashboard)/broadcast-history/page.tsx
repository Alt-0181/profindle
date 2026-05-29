import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';

const MOCK_BROADCASTS = [
  { id: '1', service: 'Brand Identity Design', titleEn: 'Logo & Brand Guidelines for Startup', budget: '฿50,000 – 100,000', matches: 12, status: 'open', expiresIn: '3 days' },
  { id: '2', service: 'SEO & Content Marketing', titleEn: 'Q3 Content Strategy Campaign', budget: '฿100,000 – 300,000', matches: 8, status: 'closed', expiresIn: null },
  { id: '3', service: 'Web Development', titleEn: 'E-Commerce Platform Build', budget: 'Over ฿500,000', matches: 5, status: 'expired', expiresIn: null },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open: { bg: '#F0F9F9', color: '#0F6F73' },
  closed: { bg: '#F0F9F9', color: '#6B7385' },
  expired: { bg: '#FFF3F3', color: '#E05454' },
};

export default async function BroadcastHistoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.broadcastHistory;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.title}</h1>
          <p style={{ fontSize: '14px', color: '#6B7385' }}>{t.subtitle}</p>
        </div>
        <a href={`/${lang}/broadcast-request`} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t.newBroadcast}
        </a>
      </div>

      {MOCK_BROADCASTS.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A8DCDF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
          </div>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#444B5A', marginBottom: '6px' }}>{t.noBroadcasts}</p>
          <p style={{ fontSize: '13px', color: '#9AA0AE' }}>{t.noBroadcastsSub}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MOCK_BROADCASTS.map((b) => {
            const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.open;
            const statusLabel = b.status === 'open' ? t.open : b.status === 'closed' ? t.closed : t.expired;
            return (
              <div key={b.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'box-shadow 150ms' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #F0F9F9, #D4EEEF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.63a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{b.titleEn}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#9AA0AE' }}>{b.service}</span>
                    <span style={{ fontSize: '12px', color: '#9AA0AE' }}>·</span>
                    <span style={{ fontSize: '12px', color: '#9AA0AE' }}>{b.budget}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F6F73' }}>{b.matches}</div>
                    <div style={{ fontSize: '11px', color: '#9AA0AE' }}>{t.matches}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ padding: '4px 10px', background: sc.bg, color: sc.color, fontSize: '12px', fontWeight: 700, borderRadius: '999px' }}>{statusLabel}</span>
                    {b.status === 'open' && b.expiresIn && (
                      <span style={{ fontSize: '11px', color: '#9AA0AE' }}>{t.expires} {b.expiresIn}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
