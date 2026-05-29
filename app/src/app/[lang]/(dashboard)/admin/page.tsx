import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.admin;

  const kpis = [
    { label: t.totalCompanies, value: '0' },
    { label: t.verified, value: '0' },
    { label: t.pending, value: '0' },
    { label: t.premium, value: '0' },
    { label: t.totalBroadcasts, value: '0' },
  ];

  const tabs = [t.companies, t.verificationQueue, t.industries, t.lineTemplates, t.activityLog];

  return (
    <div className="page-body">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.title}</h1>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ background: 'white', borderRadius: '14px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: '#171A21' }}>{kpi.value}</div>
            <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '4px' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #E4E7ED', marginBottom: '24px' }}>
        {tabs.map((tab, i) => (
          <button key={tab} style={{
            padding: '10px 18px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '14px', fontWeight: i === 0 ? 600 : 400,
            color: i === 0 ? '#0F6F73' : '#6B7385',
            borderBottom: i === 0 ? '2px solid #0F6F73' : '2px solid transparent',
            background: 'transparent', marginBottom: '-2px', transition: 'all 150ms',
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Companies table */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #F4F5F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>{t.companies}</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F4F5F7' }}>
              {[lang === 'th' ? 'บริษัท' : 'Company', lang === 'th' ? 'อีเมล' : 'Email', lang === 'th' ? 'สถานะ' : 'Status', lang === 'th' ? 'แผน' : 'Plan', lang === 'th' ? 'วันที่' : 'Date', ''].map((col) => (
                <th key={col} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9AA0AE' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#9AA0AE', fontSize: '14px' }}>
                {t.noCompanies}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Verification queue */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid rgba(247,127,0,0.25)', overflow: 'hidden', marginTop: '20px' }}>
        <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg, #FFFBF5, #FFF8EE)', borderBottom: '1px solid rgba(247,127,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>{t.verificationQueue}</span>
            <span style={{ background: '#FFF6EC', color: '#E06B00', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>0 {lang === 'th' ? 'รอดำเนินการ' : 'pending'}</span>
          </div>
        </div>
        <div style={{ padding: '48px 20px', textAlign: 'center', color: '#9AA0AE', fontSize: '14px' }}>
          {t.noPending}
        </div>
      </div>
    </div>
  );
}
