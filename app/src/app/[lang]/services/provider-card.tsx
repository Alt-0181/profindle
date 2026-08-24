import Link from 'next/link';

export type DirCompany = {
  id: string;
  name: string;
  name_th: string | null;
  description: string | null;
  description_th: string | null;
  province: string | null;
  services: string[] | null;
  verified: boolean;
  claimed: boolean;
  premium: boolean;
  logo_initial: string | null;
  logo_url: string | null;
};

// Compact provider card used by the SEO directory pages. Server component —
// just a link to the full profile.
export function ProviderCard({ c, lang }: { c: DirCompany; lang: string }) {
  const isTh = lang === 'th';
  const name = isTh && c.name_th ? c.name_th : c.name;
  const desc = isTh && c.description_th ? c.description_th : c.description;
  const initial = c.logo_initial ?? (c.name ?? '??').slice(0, 2).toUpperCase();
  return (
    <Link
      href={`/${lang}/providers/${c.id}`}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit', background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: c.logo_url ? 'none' : 'linear-gradient(135deg, #0F6F73, #1A9DA3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px', flexShrink: 0, overflow: 'hidden' }}>
          {c.logo_url ? <img src={c.logo_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>{name}</div>
            {c.verified && <span style={{ background: '#171A21', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px' }}>{isTh ? 'ยืนยันแล้ว' : 'Verified'}</span>}
          </div>
          {c.province && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9AA0AE', marginTop: '2px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {c.province}
            </div>
          )}
        </div>
        {c.premium && <span style={{ background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', flexShrink: 0 }}>✦ Pro</span>}
      </div>
      {desc && (
        <p style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
        {(c.services ?? []).slice(0, 3).map((s, i) => (
          <span key={s} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: i === 0 ? '#F0F9F9' : 'transparent', color: i === 0 ? '#0F6F73' : '#6B7385', border: i === 0 ? '1px solid transparent' : '1px solid #E4E7ED' }}>{s}</span>
        ))}
      </div>
    </Link>
  );
}
