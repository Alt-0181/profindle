import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Profindle — Thailand B2B Service Marketplace';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0E1017',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Teal glow accent */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(15,111,115,0.35)',
          filter: 'blur(120px)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(247,127,0,0.15)',
          filter: 'blur(80px)',
          display: 'flex',
        }} />

        {/* Wordmark */}
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, letterSpacing: '-5px', marginBottom: 28 }}>
          <span style={{ color: '#1A9DA3' }}>Pro</span>
          <span style={{ color: '#F77F00' }}>find</span>
          <span style={{ color: '#1A9DA3' }}>le</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.65)', fontWeight: 500, textAlign: 'center', maxWidth: 720, display: 'flex' }}>
          Thailand&apos;s B2B Service Marketplace
        </div>

        {/* Pill badges */}
        <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
          {['Verified Providers', 'Free to Use', 'LINE Notifications'].map((label) => (
            <div key={label} style={{
              padding: '10px 22px',
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(43,190,197,0.35)',
              borderRadius: '999px',
              fontSize: 18,
              color: 'rgba(255,255,255,0.6)',
              display: 'flex',
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
