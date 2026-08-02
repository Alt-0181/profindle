'use client';
import { useState } from 'react';

const zoomBtn: React.CSSProperties = {
  width: '30px', height: '30px', borderRadius: '8px', border: 'none',
  background: 'white', color: '#171A21', fontSize: '18px', fontWeight: 700,
  lineHeight: 1, cursor: 'pointer', boxShadow: '0 2px 6px rgba(14,16,23,0.25)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export function LocationMap({ query, link, isTh }: { query: string | null; link: string | null; isTh: boolean }) {
  const [zoom, setZoom] = useState(16);
  if (!query && !link) return null;

  // No-API-key embed. The iframe is drag/scroll-zoomable on its own; the +/-
  // buttons rebuild it at a new zoom level (key forces a reload).
  const src = query ? `https://maps.google.com/maps?q=${query}&z=${zoom}&output=embed` : null;

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
        {isTh ? 'ที่ตั้ง' : 'Location'}
      </div>

      {src && (
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E4E7ED', marginBottom: '12px' }}>
          <iframe
            key={zoom}
            src={src}
            width="100%"
            height={200}
            style={{ border: 0, display: 'block' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={isTh ? 'แผนที่บริษัท' : 'Company location map'}
          />
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
            <button type="button" onClick={() => setZoom((z) => Math.min(20, z + 1))} aria-label={isTh ? 'ซูมเข้า' : 'Zoom in'} style={zoomBtn}>+</button>
            <button type="button" onClick={() => setZoom((z) => Math.max(3, z - 1))} aria-label={isTh ? 'ซูมออก' : 'Zoom out'} style={zoomBtn}>−</button>
          </div>
        </div>
      )}

      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0F6F73', textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {isTh ? 'ดูใน Google Maps' : 'View on Google Maps'}
        </a>
      )}
    </div>
  );
}
