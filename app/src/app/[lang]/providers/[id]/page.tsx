import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { PublicNav } from '@/components/layout/public-nav';

export default async function ProviderProfilePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, supabase] = await Promise.all([
    getDictionary(lang as Locale),
    createClient(),
  ]);

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (!company) notFound();

  const isTh = lang === 'th';
  const displayName = isTh && company.name_th ? company.name_th : company.name;
  const displayDesc = isTh && company.description_th ? company.description_th : company.description;
  const initial = company.logo_initial ?? company.name.slice(0, 2).toUpperCase();

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", minHeight: '100vh', background: '#F4F5F7' }}>
      <PublicNav locale={lang} dict={dict} dark={false} />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0E1017 0%, #0F6F73 100%)',
        padding: '40px 24px 60px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 60% at 80% 50%, rgba(247,127,0,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto' }}>
          <Link href={`/${lang}/search-providers`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', marginBottom: '24px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            {isTh ? 'กลับไปค้นหา' : 'Back to search'}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '26px', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
              {initial}
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {displayName}
              </h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {company.verified && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '999px' }}>✓ {isTh ? 'ยืนยันแล้ว' : 'Verified'}</span>
                )}
                {company.premium && (
                  <span style={{ background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '999px' }}>✦ Premium</span>
                )}
                {company.province && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {company.province}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '860px', margin: '-28px auto 40px', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>

          {/* Left: main info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { val: company.views ?? 0, label: isTh ? 'การเข้าชม' : 'Profile Views' },
                { val: company.services?.length ?? 0, label: isTh ? 'บริการ' : 'Services' },
                { val: company.founded_year ?? '—', label: isTh ? 'ก่อตั้ง' : 'Founded' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'white', borderRadius: '14px', border: '1px solid rgba(15,111,115,0.10)', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F6F73' }}>{String(s.val)}</div>
                  <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* About */}
            {displayDesc && (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  {isTh ? 'เกี่ยวกับ' : 'About'}
                </div>
                <p style={{ fontSize: '14px', color: '#444B5A', lineHeight: 1.7 }}>{displayDesc}</p>
              </div>
            )}

            {/* Services */}
            {company.services?.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                  {isTh ? 'บริการที่เสนอ' : 'Services Offered'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {company.services.map((s: string) => (
                    <span key={s} style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '13px', fontWeight: 600, padding: '6px 14px', borderRadius: '999px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: contact card */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>
              {isTh ? 'ติดต่อผู้ให้บริการนี้' : 'Contact this provider'}
            </div>

            {company.email && (
              <a href={`mailto:${company.email}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#444B5A', fontSize: '13px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {company.email}
              </a>
            )}
            {company.phone && (
              <a href={`tel:${company.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#444B5A', fontSize: '13px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {company.phone}
              </a>
            )}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#444B5A', fontSize: '13px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                {company.website.replace(/^https?:\/\//, '')}
              </a>
            )}

            {!company.email && !company.phone && !company.website && (
              <p style={{ fontSize: '13px', color: '#9AA0AE', textAlign: 'center', padding: '12px 0' }}>
                {isTh ? 'ยังไม่มีข้อมูลติดต่อ' : 'No contact info available yet'}
              </p>
            )}

            <button style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>
              {isTh ? 'ส่งข้อความ' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
