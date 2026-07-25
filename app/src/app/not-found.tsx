import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(140deg, #0E1017 0%, #0B2B2C 50%, #0F6F73 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', 'Noto Sans Thai', -apple-system, sans-serif",
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,157,163,0.12) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,127,0,0.08) 0%, transparent 70%)',
        top: '20%',
        right: '20%',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '48px' }}>
        <img src="/assets/logo-white.svg" alt="Profindle" style={{ height: '34px', width: 'auto' }} />
      </Link>

      {/* 404 number */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <div style={{
          fontSize: 'clamp(80px, 18vw, 140px)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          userSelect: 'none',
        }}>
          404
        </div>
        {/* Teal accent line under 404 */}
        <div style={{
          position: 'absolute',
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '3px',
          background: 'linear-gradient(90deg, #0F6F73, #F77F00)',
          borderRadius: '999px',
        }} />
      </div>

      {/* Message */}
      <h1 style={{
        fontSize: 'clamp(20px, 4vw, 28px)',
        fontWeight: 700,
        color: 'white',
        textAlign: 'center',
        marginBottom: '12px',
        letterSpacing: '-0.01em',
      }}>
        Page not found
      </h1>
      <p style={{
        fontSize: '15px',
        color: 'rgba(255,255,255,0.45)',
        textAlign: 'center',
        marginBottom: '8px',
        lineHeight: 1.6,
        maxWidth: '360px',
      }}>
        The page you&apos;re looking for has moved or doesn&apos;t exist.
      </p>
      <p style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        marginBottom: '40px',
      }}>
        ไม่พบหน้าที่คุณต้องการ
      </p>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '13px 28px',
            background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)',
            color: 'white',
            fontWeight: 600,
            fontSize: '15px',
            borderRadius: '14px',
            textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(15,111,115,0.35)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Back to Home
        </Link>
        <Link
          href="/en/search-providers"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '13px 28px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 600,
            fontSize: '15px',
            borderRadius: '14px',
            textDecoration: 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Find Providers
        </Link>
      </div>

      {/* Bottom hint */}
      <p style={{ marginTop: '48px', fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
        Need help?{' '}
        <a href="mailto:support@profindle.com" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
          support@profindle.com
        </a>
      </p>
    </div>
  );
}
