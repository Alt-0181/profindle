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

type SortKey = 'relevance' | 'views' | 'az';

export function SearchProvidersClient({ lang, dict, companies, provinces }: SearchProvidersClientProps) {
  const t = dict.search;
  const isTh = lang === 'th';
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [sort, setSort] = useState<SortKey>('relevance');
  const [drawerProvider, setDrawerProvider] = useState<Company | null>(null);

  const filtered = companies
    .filter((p) => {
      if (verifiedOnly && !p.verified) return false;
      if (selectedProvince && p.province !== selectedProvince) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'views') return (b.views ?? 0) - (a.views ?? 0);
      if (sort === 'az') return a.name.localeCompare(b.name);
      // relevance: premium first, then verified, then views
      if (b.premium !== a.premium) return b.premium ? 1 : -1;
      if (b.verified !== a.verified) return b.verified ? 1 : -1;
      return (b.views ?? 0) - (a.views ?? 0);
    });

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", minHeight: '100vh', background: '#F4F5F7' }}>
      <PublicNav locale={lang} dict={dict} dark={false} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(140deg, #0E1017 0%, #0F6F73 100%)', padding: '48px 24px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(247,127,0,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {isTh ? 'ค้นหาผู้ให้บริการ' : 'Find Service Providers'}
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', marginBottom: '32px' }}>
            {isTh ? 'ค้นหาผู้ให้บริการ B2B ที่ผ่านการตรวจสอบทั่วไทย — ไม่ต้องสมัครสมาชิก' : 'Browse verified Thai B2B service providers — no account needed'}
          </p>
          <SearchCard lang={lang} />
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Filter rail */}
        <div style={{ position: 'sticky', top: '80px', background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '16px' }}>{t.filters}</div>

          {/* Tier chips */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${verifiedOnly ? '#0F6F73' : '#E4E7ED'}`, background: verifiedOnly ? '#F0F9F9' : 'transparent', color: verifiedOnly ? '#0F6F73' : '#6B7385' }}
            >
              ✓ {isTh ? 'ยืนยันแล้ว' : 'Verified'}
            </button>
          </div>

          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9AA0AE', marginBottom: '8px' }}>{t.province}</div>
          {provinces.map((p) => (
            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: selectedProvince === p ? '#0F6F73' : '#444B5A', cursor: 'pointer', marginBottom: '8px', fontWeight: selectedProvince === p ? 600 : 400 }}>
              <input type="checkbox" checked={selectedProvince === p} onChange={(e) => setSelectedProvince(e.target.checked ? p : '')} style={{ accentColor: '#0F6F73', width: '14px', height: '14px' }} />
              {p}
            </label>
          ))}
        </div>

        {/* Provider grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#6B7385' }}>
              {isTh ? 'แสดง' : 'Showing'} <strong style={{ color: '#171A21' }}>{filtered.length}</strong> {t.providersFound}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={{ fontSize: '13px', color: '#444B5A', border: '1px solid #E4E7ED', borderRadius: '8px', padding: '6px 12px', background: 'white', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}
            >
              <option value="relevance">{isTh ? 'เรียงตาม: ความเกี่ยวข้อง' : 'Sort: Relevance'}</option>
              <option value="views">{isTh ? 'เรียงตาม: ยอดเข้าชม' : 'Sort: Most Viewed'}</option>
              <option value="az">{isTh ? 'เรียงตาม: A–Z' : 'Sort: A–Z'}</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed #E4E7ED', borderRadius: '16px', background: 'white' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21', marginBottom: '8px' }}>
                {isTh ? 'ไม่พบผู้ให้บริการที่ตรงกัน — ให้ผู้ให้บริการมาหาคุณ' : 'No exact match — let providers come to you'}
              </div>
              <p style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 20px' }}>
                {isTh ? 'ประกาศคำขอและผู้ให้บริการที่ตรงกันทุกรายจะได้รับแจ้งผ่าน LINE ทันที ' : 'Broadcast your request and every matching provider gets pinged on LINE instantly. '}
                <strong style={{ color: '#F77F00' }}>{isTh ? 'ฟรี 100%' : '100% free'}</strong>
                {isTh ? ' — ไม่มีค่าคอมมิชชั่น' : ' — no commission.'}
              </p>
              <Link href={`/${lang}/signup`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none' }}>
                {isTh ? 'ประกาศคำขอของฉัน — ฟรี' : 'Broadcast my request — Free'}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filtered.map((p) => (
                <div
                  key={p.id}
                  style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px', cursor: 'pointer', transition: 'box-shadow 150ms' }}
                  onClick={() => setDrawerProvider(p)}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,111,115,0.12)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                      {p.logo_initial ?? p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21', lineHeight: 1.3 }}>
                          {isTh && p.name_th ? p.name_th : p.name}
                        </div>
                        {p.premium && (
                          <span style={{ background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', flexShrink: 0, whiteSpace: 'nowrap' }}>✦ Pro</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9AA0AE', marginTop: '3px', flexWrap: 'wrap' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {p.province}
                        {p.verified && <span style={{ background: '#171A21', color: 'white', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px' }}>Verified</span>}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#444B5A', lineHeight: 1.55, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {isTh && p.description_th ? p.description_th : p.description}
                  </p>

                  {/* First chip teal filled, rest outline */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {p.services.slice(0, 3).map((s, i) => (
                      <span key={s} style={{
                        fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px',
                        background: i === 0 ? '#F0F9F9' : 'transparent',
                        color: i === 0 ? '#0F6F73' : '#6B7385',
                        border: i === 0 ? '1px solid transparent' : '1px solid #E4E7ED',
                      }}>{s}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F4F5F7', paddingTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#9AA0AE' }}>{(p.views ?? 0).toLocaleString()} {isTh ? 'การเข้าชม' : 'profile views'}</span>
                    <button style={{ padding: '7px 16px', background: p.premium ? 'linear-gradient(135deg, #0F6F73, #1A9DA3)' : 'transparent', color: p.premium ? 'white' : '#0F6F73', border: p.premium ? 'none' : '1.5px solid #0F6F73', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {t.viewProfile}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Signup banner */}
      <div style={{ background: 'linear-gradient(135deg, #0B2B2C 0%, #0F6F73 100%)', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            {isTh ? 'ต้องการให้ผู้ให้บริการมาหาคุณทันที?' : 'Want providers to come to you — instantly?'}
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '28px' }}>
            {isTh
              ? 'ประกาศคำขอของคุณ และผู้ให้บริการที่ตรงกันทุกรายจะได้รับแจ้งผ่าน LINE ทันที '
              : 'Broadcast your request and every matching provider gets notified on LINE in real time. '}
            <strong style={{ color: '#F77F00' }}>{isTh ? 'ฟรี 100%' : '100% free'}</strong>
            {isTh ? ' — ไม่มีค่าคอมมิชชั่น ไม่มีค่าใช้จ่ายแอบแฝง' : ' — no hidden fees, no commission.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/${lang}/signup`} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontWeight: 700, fontSize: '14px', borderRadius: '12px', textDecoration: 'none' }}>
              {isTh ? 'สร้างบัญชีฟรี' : 'Create Free Account'}
            </Link>
            <Link href={`/${lang}/login`} style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.10)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.2)' }}>
              {isTh ? 'เข้าสู่ระบบ' : 'Sign In'}
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Drawer */}
      {drawerProvider && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500 }} onClick={() => setDrawerProvider(null)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,16,23,0.5)', backdropFilter: 'blur(4px)' }} />
          <div
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '540px', maxWidth: '100vw', background: 'white', overflowY: 'auto', animation: 'slideIn 250ms cubic-bezier(0.4,0,0.2,1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div style={{ background: 'linear-gradient(135deg, #171A21 0%, #0F6F73 100%)', padding: '28px 24px 24px', position: 'relative' }}>
              <button onClick={() => setDrawerProvider(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '16px' }}>✕</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '24px', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
                  {drawerProvider.logo_initial ?? drawerProvider.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '6px' }}>
                    {isTh && drawerProvider.name_th ? drawerProvider.name_th : drawerProvider.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                    {drawerProvider.province}{drawerProvider.services?.[0] ? ` · ${drawerProvider.services[0]}` : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {drawerProvider.verified && <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>✓ {isTh ? 'ยืนยันแล้ว' : 'Verified'}</span>}
                {drawerProvider.premium && <span style={{ background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px' }}>✦ Pro</span>}
              </div>
            </div>

            {/* Drawer body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { val: (drawerProvider.views ?? 0).toLocaleString(), label: isTh ? 'การเข้าชม' : 'Profile Views' },
                  { val: drawerProvider.services?.length ?? 0, label: isTh ? 'บริการ' : 'Services' },
                  { val: drawerProvider.founded_year ? `${isTh ? 'ก่อตั้ง ' : 'Est. '}${drawerProvider.founded_year}` : '—', label: isTh ? 'ก่อตั้ง' : 'Est. Since' },
                ].map((s) => (
                  <div key={s.label} style={{ background: '#F4F8F8', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F6F73' }}>{String(s.val)}</div>
                    <div style={{ fontSize: '11px', color: '#9AA0AE', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* About */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{isTh ? 'เกี่ยวกับ' : 'About'}</div>
                <p style={{ fontSize: '14px', color: '#444B5A', lineHeight: 1.7, margin: 0 }}>
                  {isTh && drawerProvider.description_th ? drawerProvider.description_th : drawerProvider.description}
                </p>
              </div>

              {/* Services */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{dict.search.services}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {drawerProvider.services?.map((s, i) => (
                    <span key={s} style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '999px', background: i === 0 ? '#F0F9F9' : 'transparent', color: i === 0 ? '#0F6F73' : '#6B7385', border: i === 0 ? '1px solid transparent' : '1px solid #E4E7ED' }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{isTh ? 'ติดต่อ' : 'Contact'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {drawerProvider.phone && (
                    <a href={`tel:${drawerProvider.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#171A21', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {drawerProvider.phone}
                      </div>
                      <span style={{ fontSize: '12px', color: '#0F6F73', fontWeight: 600 }}>{isTh ? 'โทร →' : 'Call →'}</span>
                    </a>
                  )}
                  {drawerProvider.email && (
                    <a href={`mailto:${drawerProvider.email}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#171A21', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        {drawerProvider.email}
                      </div>
                      <span style={{ fontSize: '12px', color: '#0F6F73', fontWeight: 600 }}>{isTh ? 'อีเมล →' : 'Email →'}</span>
                    </a>
                  )}
                  {drawerProvider.website && (
                    <a href={drawerProvider.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#171A21', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        {drawerProvider.website.replace(/^https?:\/\//, '')}
                      </div>
                      <span style={{ fontSize: '12px', color: '#0F6F73', fontWeight: 600 }}>{isTh ? 'เยี่ยมชม →' : 'Visit →'}</span>
                    </a>
                  )}
                  {drawerProvider.line_id && (
                    <a href={`https://line.me/ti/p/${drawerProvider.line_id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#171A21', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="#06C755"><path d="M19.365 9.89c.50 0 .866.37.866.87s-.368.87-.866.87H17.61v1.05h1.754c.498 0 .866.37.866.87s-.368.87-.866.87H16.74a.87.87 0 0 1-.866-.87V8.14c0-.498.368-.868.866-.868h2.624c.498 0 .866.37.866.87s-.368.87-.866.87H17.61v.878h1.754zm-6.735 3.65a.868.868 0 0 1-.607-.247l-2.627-2.78v2.16a.866.866 0 1 1-1.732 0V8.14a.866.866 0 0 1 1.474-.618l2.627 2.78V8.14a.866.866 0 1 1 1.732 0v5.4a.868.868 0 0 1-.866.868v.002zm-5.74 0a.866.866 0 0 1-.866-.868V8.14a.866.866 0 1 1 1.732 0v5.4a.866.866 0 0 1-.866.868v-.002zM24 10.314C24 4.943 18.617.572 12 .572S0 4.943 0 10.314c0 4.814 4.27 8.842 10.035 9.608.392.084.923.258 1.058.592.12.302.079.776.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.966C23.176 14.143 24 12.33 24 10.314z"/></svg>
                        {drawerProvider.line_id}
                      </div>
                      <span style={{ fontSize: '12px', color: '#0F6F73', fontWeight: 600 }}>{isTh ? 'เพิ่ม →' : 'Add →'}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Social */}
              {(drawerProvider.social_facebook || drawerProvider.social_instagram) && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {drawerProvider.social_facebook && (
                    <a href={`https://${drawerProvider.social_facebook}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#444B5A', fontSize: '13px', fontWeight: 600 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </a>
                  )}
                  {drawerProvider.social_instagram && (
                    <a href={`https://${drawerProvider.social_instagram}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#444B5A', fontSize: '13px', fontWeight: 600 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="url(#ig)" strokeWidth="2" strokeLinecap="round"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#F77737"/><stop offset="50%" stopColor="#C13584"/><stop offset="100%" stopColor="#833AB4"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      Instagram
                    </a>
                  )}
                </div>
              )}

              {/* CTAs */}
              <Link
                href={`/${lang}/providers/${drawerProvider.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '13px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}
              >
                {isTh ? 'ดูโปรไฟล์เต็มพร้อมผลงาน →' : 'View Full Profile & Portfolio →'}
              </Link>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}
