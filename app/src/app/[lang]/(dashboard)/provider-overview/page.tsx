'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';

const MOCK_SERVICES = [
  { id: '1', name: 'Brand Identity Design', category: 'Creative & Branding', views: 142, inquiries: 8 },
  { id: '2', name: 'SEO & Content Marketing', category: 'Digital Marketing', views: 89, inquiries: 5 },
  { id: '3', name: 'Web Development', category: 'Technology', views: 211, inquiries: 14 },
];

export default function ProviderOverviewPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const [services] = useState(MOCK_SERVICES);

  const t = {
    title: lang === 'th' ? 'ภาพรวมผู้ให้บริการ' : 'Provider Overview',
    subtitle: lang === 'th' ? 'จัดการบริการและติดตามผลงาน' : 'Manage your services and track your performance',
    services: lang === 'th' ? 'บริการของคุณ' : 'Your Services',
    servicesAdd: lang === 'th' ? 'จัดการบริการ' : 'Manage Services',
    performance: lang === 'th' ? 'ผลงาน' : 'Performance',
    noServices: lang === 'th' ? 'ยังไม่มีบริการ' : 'No services added yet',
    addServices: lang === 'th' ? 'เพิ่มบริการ' : 'Add Services',
    views: lang === 'th' ? 'การเข้าชม' : 'Views',
    inquiries: lang === 'th' ? 'การสอบถาม' : 'Inquiries',
    thisMonth: lang === 'th' ? 'เดือนนี้' : 'This month',
  };

  const totalViews = services.reduce((s, sv) => s + sv.views, 0);
  const totalInquiries = services.reduce((s, sv) => s + sv.inquiries, 0);

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.title}</h1>
          <p style={{ fontSize: '14px', color: '#6B7385' }}>{t.subtitle}</p>
        </div>
        <button style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
          {t.servicesAdd}
        </button>
      </div>

      {/* Performance KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: t.views, value: totalViews, sub: t.thisMonth, icon: 'eye' },
          { label: t.inquiries, value: totalInquiries, sub: t.thisMonth, icon: 'mail' },
          { label: lang === 'th' ? 'บริการที่ใช้งาน' : 'Active Services', value: services.length, sub: lang === 'th' ? 'รวม' : 'total', icon: 'grid' },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px 24px' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: '#171A21', marginBottom: '4px' }}>{kpi.value}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#444B5A' }}>{kpi.label}</div>
            <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '2px' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Services list */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #F4F5F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>{t.services}</span>
        </div>

        {services.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#444B5A', marginBottom: '6px' }}>{t.noServices}</p>
            <button style={{ marginTop: '16px', padding: '10px 24px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {t.addServices}
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F4F5F7' }}>
                {[lang === 'th' ? 'บริการ' : 'Service', lang === 'th' ? 'หมวดหมู่' : 'Category', t.views, t.inquiries, ''].map((col) => (
                  <th key={col} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9AA0AE' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((sv, i) => (
                <tr key={sv.id} style={{ borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{sv.name}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', background: '#F0F9F9', color: '#0F6F73', fontSize: '12px', fontWeight: 600, borderRadius: '999px' }}>{sv.category}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{sv.views}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{sv.inquiries}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button style={{ padding: '6px 14px', background: 'transparent', border: '1.5px solid #E4E7ED', color: '#444B5A', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {lang === 'th' ? 'แก้ไข' : 'Edit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
