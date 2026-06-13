'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { INDUSTRIES } from '@/lib/mock/industries';

interface SearchCardProps {
  lang: string;
}

export function SearchCard({ lang }: SearchCardProps) {
  const router = useRouter();
  const [service, setService] = useState('');
  const [info, setInfo] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = service.trim().length >= 1
    ? INDUSTRIES.flatMap((ind) =>
        ind.services
          .filter((s) => s.toLowerCase().includes(service.toLowerCase()))
          .map((s) => ({ service: s, industry: ind.name }))
      ).slice(0, 20)
    : [];

  const grouped = matches.reduce<Record<string, string[]>>((acc, m) => {
    if (!acc[m.industry]) acc[m.industry] = [];
    acc[m.industry].push(m.service);
    return acc;
  }, {});

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function highlightMatch(text: string, query: string) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ color: '#0F6F73', fontWeight: 700 }}>{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  }

  const showGuidance = service.trim().length > 0 && !open;

  return (
    <>
      {/* Search Card */}
      <div style={{
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 4px 16px rgba(15,111,115,0.15)',
        maxWidth: '520px', width: '100%', margin: '0 auto', position: 'relative',
      }}>
        {/* Service Type field */}
        <div ref={dropdownRef} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '13px 16px', borderBottom: '1px solid #F0F0F0', position: 'relative', zIndex: 50 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#171A21', display: 'block', marginBottom: '3px', textAlign: 'left' }}>
              {lang === 'th' ? 'ประเภทบริการ' : 'Service Type'}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={service}
              onChange={(e) => { setService(e.target.value); setOpen(true); }}
              onFocus={() => service && setOpen(true)}
              placeholder={lang === 'th' ? 'จัดอีเวนต์, การตลาด, ออกแบบ…' : 'Event Planning, Marketing, Design…'}
              style={{ width: '100%', fontSize: '13px', color: '#444B5A', border: 'none', outline: 'none', background: 'transparent', caretColor: '#0F6F73', fontFamily: 'inherit', textAlign: 'left' }}
            />
          </div>

          {/* Autocomplete dropdown */}
          {open && matches.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: 'white', border: '1.5px solid rgba(15,111,115,0.18)',
              borderRadius: '14px', boxShadow: '0 12px 48px rgba(15,111,115,0.22), 0 2px 8px rgba(0,0,0,0.06)',
              zIndex: 200, overflow: 'hidden', maxHeight: '360px', overflowY: 'auto',
            }}>
              {Object.entries(grouped).map(([industry, services]) => (
                <div key={industry}>
                  <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9AA0AE' }}>
                    {industry}
                  </div>
                  {services.map((svc) => (
                    <div
                      key={svc}
                      onMouseDown={(e) => { e.preventDefault(); setService(svc); setOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: '#171A21', transition: 'background 100ms' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F9F9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#F0F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2.2" strokeLinecap="round">
                          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                      </div>
                      <span>{highlightMatch(svc, service)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Information field */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '13px 16px' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#171A21', display: 'block', marginBottom: '3px', textAlign: 'left' }}>
              <span>{lang === 'th' ? 'ข้อมูลเพิ่มเติม' : 'Additional Information'}</span>
              {' '}<span style={{ color: '#9AA0AE', fontWeight: 400 }}>{lang === 'th' ? '(ไม่บังคับ)' : '(Optional)'}</span>
            </label>
            <input
              type="text"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder={lang === 'th' ? 'กรุงเทพฯ, CentralWorld, ABC Corporation…' : 'Bangkok, CentralWorld, ABC Corporation…'}
              style={{ width: '100%', fontSize: '13px', color: '#444B5A', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', textAlign: 'left' }}
            />
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={() => router.push(`/${lang}/search-providers${service ? `?q=${encodeURIComponent(service)}` : ''}`)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '13px', background: 'linear-gradient(135deg, #0F6F73 0%, #1A9DA3 100%)',
            color: 'white', fontWeight: 600, fontSize: '15px', borderRadius: '14px',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 2px 8px rgba(15,111,115,0.25)', transition: 'all 150ms',
            boxSizing: 'border-box',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          {lang === 'th' ? 'ค้นหาผู้ให้บริการ' : 'Search Providers'}
        </button>
      </div>

      {/* Guidance pill — only mounted when dropdown is closed and service is typed */}
      {showGuidance && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px',
          padding: '12px 16px', marginTop: '14px',
          maxWidth: '520px', width: '100%',
        }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(247,127,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F77F00" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, textAlign: 'left' }}>
            {lang === 'th' ? (
              <>คุณกำลังมองหาผู้ให้บริการที่มีความเชี่ยวชาญใน{' '}
                <strong style={{ color: '#2BBEC5', fontWeight: 600 }}>{service}</strong>
                {info && <>{' '}ใน / ที่{' '}<span style={{ color: '#F77F00', fontWeight: 600 }}>{info}</span></>}
              </>
            ) : (
              <>You are looking for service providers with experience in{' '}
                <strong style={{ color: '#2BBEC5', fontWeight: 600 }}>{service}</strong>
                {info && <>{' '}with / at{' '}<span style={{ color: '#F77F00', fontWeight: 600 }}>{info}</span></>}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
