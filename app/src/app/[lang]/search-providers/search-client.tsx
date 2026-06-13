'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Dictionary } from '@/dictionaries';
import { PublicNav } from '@/components/layout/public-nav';
import { SearchCard } from '../search-card';
import type { Company } from './page';

interface SearchProvidersClientProps {
  lang: string;
  dict: Dictionary;
  companies: Company[];
  provinces: string[];
}

export function SearchProvidersClient({ lang, dict, companies, provinces }: SearchProvidersClientProps) {
  const t = dict.search;
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [drawerProvider, setDrawerProvider] = useState<Company | null>(null);

  const filtered = companies.filter((p) => {
    if (verifiedOnly && !p.verified) return false;
    if (selectedProvince && p.province !== selectedProvince) return false;
    return true;
  });

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", minHeight: '100vh', background: '#F4F5F7' }}>
      <PublicNav locale={lang} dict={dict} dark={false} />

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(140deg, #0E1017 0%, #0F6F73 100%)',
        padding: '48px 24px 40px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(247,127,0,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {lang === 'th' ? 'ค้นหาผู้ให้บริการ' : 'Find Service Providers'}
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', marginBottom: '32px' }}>
            {lang === 'th' ? 'ค้นหาผู้ให้บริการ B2B ที่ผ่านการตรวจสอบทั่วไทย — ไม่ต้องสมัครสมาชิก' : 'Browse verified Thai B2B service providers — no account needed'}
          </p>
          <SearchCard lang={lang} />
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Filter rail */}
        <div style={{ position: 'sticky', top: '80px', background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '16px' }}>{t.filters}</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#444B5A', cursor: 'pointer', marginBottom: '12px' }}>
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} style={{ accentColor: '#0F6F73', width: '16px', height: '16px' }} />
            {t.verified}
          </label>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9AA0AE', marginBottom: '8px', marginTop: '16px' }}>{t.province}</div>
          {provinces.map((p) => (
            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#444B5A', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" checked={selectedProvince === p} onChange={(e) => setSelectedProvince(e.target.checked ? p : '')} style={{ accentColor: '#0F6F73', width: '14px', height: '14px' }} />
              {p}
            </label>
          ))}
        </div>

        {/* Provider grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#6B7385' }}>
              {lang === 'th' ? 'แสดง' : 'Showing'} <strong style={{ color: '#171A21' }}>{filtered.length}</strong> {t.providersFound}
            </div>
            <select style={{ fontSize: '13px', color: '#444B5A', border: '1px solid #E4E7ED', borderRadius: '8px', padding: '6px 12px', background: 'white', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
              <option>{lang === 'th' ? 'เรียงตาม: ความเกี่ยวข้อง' : 'Sort: Relevance'}</option>
              <option>{lang === 'th' ? 'เรียงตาม: ยอดนิยม' : 'Sort: Most Viewed'}</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              border: '2px dashed #E4E7ED', borderRadius: '16px',
              background: 'white',
            }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>
                {lang === 'th' ? 'ไม่พบผู้ให้บริการที่ตรงกัน — ให้ผู้ให้บริการมาหาคุณ' : 'No exact match — let providers come to you'}
              </div>
              <p style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 20px' }}>
                {lang === 'th'
                  ? 'ประกาศคำขอของคุณ และผู้ให้บริการที่ตรงกันทุกรายบน Profindle จะได้รับแจ้งผ่าน LINE ทันที '
                  : 'Broadcast your request and every matching service provider on Profindle gets pinged on LINE instantly. '}
                <strong style={{ color: '#F77F00' }}>{lang === 'th' ? 'ฟรี 100%' : '100% free'}</strong>
                {lang === 'th' ? ' — ไม่มีค่าคอมมิชชั่น ไม่มีค่าใช้จ่ายแอบแฝง' : ' — no commission, no hidden fees.'}
              </p>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {lang === 'th' ? 'ประกาศคำขอของฉัน — ฟรี' : 'Broadcast my request — Free'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filtered.map((p) => (
                <div
                  key={p.id}
                  style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px', cursor: 'pointer', transition: 'all 200ms' }}
                  onClick={() => setDrawerProvider(p)}
                >
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                      {p.logo_initial ?? p.name.slice(0,2).toUpperCase()}
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
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
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '540px', maxWidth: '100vw', background: 'white', overflowY: 'auto', animation: 'slideIn 250ms cubic-bezier(0.4,0,0.2,1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: 'linear-gradient(135deg, #171A21 0%, #0F6F73 100%)', padding: '28px 24px', position: 'relative' }}>
              <button onClick={() => setDrawerProvider(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '16px' }}>✕</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '24px', flexShrink: 0 }}>
                  {drawerProvider.logo_initial ?? drawerProvider.name.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>{lang === 'th' ? drawerProvider.name_th : drawerProvider.name}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {drawerProvider.verified && <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>✓ Verified</span>}
                    {drawerProvider.premium && <span style={{ background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>✦ Premium</span>}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { val: '0', label: lang === 'th' ? 'โปรเจกต์' : 'Projects' },
                  { val: drawerProvider.views.toString(), label: lang === 'th' ? 'การเข้าชม' : 'Views' },
                  { val: drawerProvider.province, label: lang === 'th' ? 'จังหวัด' : 'Province' },
                ].map((s) => (
                  <div key={s.label} style={{ background: '#F4F8F8', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F6F73' }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: '#9AA0AE', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{lang === 'th' ? 'เกี่ยวกับ' : 'About'}</div>
                <p style={{ fontSize: '14px', color: '#444B5A', lineHeight: 1.6 }}>{lang === 'th' ? drawerProvider.description_th : drawerProvider.description}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{dict.search.services}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {drawerProvider.services.map((s) => (
                    <span key={s} style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px' }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href={`/${lang}/providers/${drawerProvider.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '13px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}
                >
                  {lang === 'th' ? 'ดูโปรไฟล์เต็ม →' : 'View Full Profile →'}
                </Link>
                <button style={{ width: '100%', padding: '12px', background: 'transparent', color: '#0F6F73', fontWeight: 600, fontSize: '14px', border: '1.5px solid #0F6F73', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {lang === 'th' ? 'ติดต่อผู้ให้บริการ' : 'Contact Provider'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}
