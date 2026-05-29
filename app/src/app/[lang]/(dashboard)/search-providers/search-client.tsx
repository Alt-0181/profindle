'use client';

import { useState } from 'react';
import type { Dictionary } from '@/dictionaries';

interface SearchProvidersClientProps {
  lang: string;
  dict: Dictionary;
}

const MOCK_PROVIDERS = [
  {
    id: '1',
    name: 'Digital Bridge Agency',
    name_th: 'ดิจิทัล บริดจ์ เอเจนซี่',
    province: 'Bangkok',
    services: ['Digital Marketing', 'Social Media', 'SEO/SEM'],
    description: 'Full-service digital marketing agency specializing in B2B growth.',
    description_th: 'เอเจนซี่การตลาดดิจิทัลครบวงจร เชี่ยวชาญด้านการเติบโต B2B',
    verified: true,
    premium: true,
    views: 124,
    initial: 'DB',
  },
  {
    id: '2',
    name: 'CodeCraft Studio',
    name_th: 'โค้ดคราฟต์ สตูดิโอ',
    province: 'Chiang Mai',
    services: ['Web Development', 'Mobile App', 'UI/UX Design'],
    description: 'Award-winning web and mobile development studio.',
    description_th: 'สตูดิโอพัฒนาเว็บและแอปที่ได้รับรางวัล',
    verified: true,
    premium: false,
    views: 89,
    initial: 'CC',
  },
  {
    id: '3',
    name: 'Legal Nexus Thailand',
    name_th: 'ลีกัล เน็กซัส ไทยแลนด์',
    province: 'Bangkok',
    services: ['Corporate Law', 'Contract Review', 'IP & Trademark'],
    description: 'Boutique law firm focused on technology and commercial law.',
    description_th: 'สำนักงานกฎหมายเฉพาะทางด้านเทคโนโลยีและกฎหมายพาณิชย์',
    verified: true,
    premium: true,
    views: 203,
    initial: 'LN',
  },
];

export function SearchProvidersClient({ lang, dict }: SearchProvidersClientProps) {
  const t = dict.search;
  const [serviceQuery, setServiceQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [drawerProvider, setDrawerProvider] = useState<typeof MOCK_PROVIDERS[0] | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = MOCK_PROVIDERS.filter((p) => {
    if (verifiedOnly && !p.verified) return false;
    if (serviceQuery && !p.services.some((s) => s.toLowerCase().includes(serviceQuery.toLowerCase()))) return false;
    if (locationQuery && !p.province.toLowerCase().includes(locationQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* Search Hero */}
      <div style={{
        background: 'linear-gradient(140deg, #0E1017 0%, #0F6F73 100%)',
        padding: '32px 24px 24px', position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(247,127,0,0.08) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{t.title}</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '20px' }}>{t.subtitle}</p>

          {/* Search card */}
          <div style={{
            background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
            borderRadius: '20px', padding: '6px', maxWidth: '540px',
            boxShadow: '0 12px 48px rgba(15,111,115,0.22)',
          }}>
            <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', borderBottom: '1px solid #F0F0F0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#171A21', marginBottom: '3px' }}>{t.serviceLabel}</div>
                <input type="text" value={serviceQuery} onChange={(e) => setServiceQuery(e.target.value)} placeholder={t.servicePh} style={{ width: '100%', fontSize: '13px', color: '#444B5A', border: 'none', outline: 'none', background: 'transparent' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '12px 16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#171A21', marginBottom: '3px' }}>{t.locationLabel}</div>
                <input type="text" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} placeholder={t.locationPh} style={{ width: '100%', fontSize: '13px', color: '#444B5A', border: 'none', outline: 'none', background: 'transparent' }} />
              </div>
            </div>
            <button style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {t.searchBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Filter rail */}
        <div style={{ position: 'sticky', top: '80px', background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '16px' }}>{t.filters}</div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#444B5A', cursor: 'pointer', marginBottom: '12px' }}>
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} style={{ accentColor: '#0F6F73', width: '16px', height: '16px' }} />
            {t.verified}
          </label>

          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9AA0AE', marginBottom: '8px', marginTop: '16px' }}>{t.province}</div>
          {['Bangkok', 'Chiang Mai', 'Phuket', 'Khon Kaen', 'Chon Buri'].map((p) => (
            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#444B5A', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" style={{ accentColor: '#0F6F73', width: '14px', height: '14px' }} />
              {p}
            </label>
          ))}
        </div>

        {/* Provider grid */}
        <div>
          <div style={{ fontSize: '14px', color: '#6B7385', marginBottom: '16px' }}>
            <strong style={{ color: '#171A21' }}>{filtered.length}</strong> {t.providersFound}
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed #E4E7ED', borderRadius: '16px', color: '#9AA0AE' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>{t.noResults}</div>
              <div style={{ fontSize: '13px' }}>{t.noResultsSub}</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {filtered.map((p) => (
                <div key={p.id} style={{
                  background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)',
                  padding: '20px', cursor: 'pointer', transition: 'all 200ms',
                }} onClick={() => setDrawerProvider(p)}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                      {p.initial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>
                          {lang === 'th' ? p.name_th : p.name}
                        </div>
                        {p.premium && (
                          <span style={{ background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', flexShrink: 0 }}>✦ Premium</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9AA0AE', marginTop: '2px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        {p.province}
                        {p.verified && (
                          <span style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '999px', marginLeft: '4px' }}>✓ Verified</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#444B5A', lineHeight: 1.55, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lang === 'th' ? p.description_th : p.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {p.services.slice(0, 3).map((s) => (
                      <span key={s} style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F4F5F7', paddingTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#9AA0AE' }}>{p.views} views</span>
                    <button style={{ padding: '7px 16px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {t.viewProfile}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Drawer */}
      {drawerProvider && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500 }} onClick={() => setDrawerProvider(null)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,16,23,0.45)', backdropFilter: 'blur(3px)' }} />
          <div
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: '540px', maxWidth: '100vw',
              background: 'white', overflowY: 'auto',
              animation: 'slideIn 250ms cubic-bezier(0.4,0,0.2,1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div style={{ background: 'linear-gradient(135deg, #171A21 0%, #0F6F73 100%)', padding: '28px 24px', position: 'relative' }}>
              <button onClick={() => setDrawerProvider(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                ✕
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '24px', flexShrink: 0 }}>
                  {drawerProvider.initial}
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>
                    {lang === 'th' ? drawerProvider.name_th : drawerProvider.name}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {drawerProvider.verified && <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>✓ Verified</span>}
                    {drawerProvider.premium && <span style={{ background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>✦ Premium</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer body */}
            <div style={{ padding: '20px 24px' }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { val: '0', label: lang === 'th' ? 'โปรเจกต์' : 'Projects' },
                  { val: drawerProvider.views.toString(), label: lang === 'th' ? 'การเข้าชม' : 'Views' },
                  { val: drawerProvider.province, label: lang === 'th' ? 'จังหวัด' : 'Province' },
                ].map((s) => (
                  <div key={s.label} style={{ background: '#F4F8F8', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, background: 'linear-gradient(90deg, #0F6F73, #F77F00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: '#9AA0AE', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* About */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {lang === 'th' ? 'เกี่ยวกับ' : 'About'}
                </div>
                <p style={{ fontSize: '14px', color: '#444B5A', lineHeight: 1.6 }}>
                  {lang === 'th' ? drawerProvider.description_th : drawerProvider.description}
                </p>
              </div>

              {/* Services */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {dict.search.services}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {drawerProvider.services.map((s) => (
                    <span key={s} style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px' }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {lang === 'th' ? 'ติดต่อ' : 'Contact'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '1px solid #E4E7ED', borderRadius: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9AA0AE', marginBottom: '2px' }}>Email</div>
                      <div style={{ fontSize: '13px', color: '#171A21', fontWeight: 500 }}>contact@example.com</div>
                    </div>
                  </div>
                </div>
              </div>

              <button style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {lang === 'th' ? 'ติดต่อผู้ให้บริการ' : 'Contact Provider'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
