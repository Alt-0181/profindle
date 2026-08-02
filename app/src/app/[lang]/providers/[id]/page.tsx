import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { PublicNav } from '@/components/layout/public-nav';
import { PortfolioGrid } from './portfolio-grid';
import { LineContactRow } from './line-contact-row';

// Always render against live data so a provider's public profile reflects the
// current portfolio (no stale cache showing removed/duplicate projects).
export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://profindle.com';

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { lang, id } = await params;
  const admin = getAdmin();
  const { data: company } = await admin
    .from('companies')
    .select('name, name_th, description, description_th')
    .eq('id', id)
    .single();
  if (!company) return {};
  const isTh = lang === 'th';
  const displayName = isTh && company.name_th ? company.name_th : company.name;
  const displayDesc = isTh && company.description_th ? company.description_th : company.description;
  return {
    title: displayName,
    description: displayDesc ?? `${displayName} — B2B service provider in Thailand on Profindle`,
    alternates: {
      canonical: `${siteUrl}/${lang}/providers/${id}`,
      languages: {
        en: `${siteUrl}/en/providers/${id}`,
        th: `${siteUrl}/th/providers/${id}`,
        'x-default': `${siteUrl}/en/providers/${id}`,
      },
    },
    openGraph: {
      title: displayName,
      description: displayDesc ?? `${displayName} on Profindle`,
      type: 'profile',
    },
  };
}

function proxyPortfolioImages(projects: any[]): any[] {
  return projects.map((p) => {
    if (!p.images?.length) return p;
    const proxied = p.images.map((url: string) => {
      if (!url) return url;
      const match = url.match(/\/portfolio-images\/(.+?)(?:\?|$)/);
      if (!match) return url;
      const vMatch = url.match(/[?&]v=(\d+)/);
      const vParam = vMatch ? `&v=${vMatch[1]}` : '';
      return `/api/portfolio-image?path=${encodeURIComponent(match[1])}${vParam}`;
    });
    return { ...p, images: proxied };
  });
}

// Turn a pasted Google Maps URL into an embeddable (no-API-key) map src.
// Resolves short links, then pulls coordinates or a place query out of the URL.
async function mapEmbedSrc(raw: string | null | undefined): Promise<string | null> {
  if (!raw || !/^https?:\/\//i.test(raw)) return null;
  let url = raw.trim();
  try {
    if (/(?:goo\.gl|maps\.app\.goo\.gl)/i.test(url)) {
      const res = await fetch(url, { redirect: 'follow' });
      if (res?.url) url = res.url;
    }
  } catch {
    /* keep the original URL if resolving the short link fails */
  }
  const coord =
    url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
    url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ||
    url.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coord) return `https://maps.google.com/maps?q=${coord[1]},${coord[2]}&z=16&output=embed`;
  const q = url.match(/[?&](?:q|query)=([^&]+)/);
  if (q) return `https://maps.google.com/maps?q=${q[1]}&output=embed`;
  const place = url.match(/\/maps\/place\/([^/@?]+)/);
  if (place) return `https://maps.google.com/maps?q=${place[1]}&output=embed`;
  return null;
}

export default async function ProviderProfilePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const admin = getAdmin();
  const dict = await getDictionary(lang as Locale);

  const [{ data: company }, { data: rawPortfolio }] = await Promise.all([
    admin.from('companies').select('*').eq('id', id).single(),
    admin.from('portfolio_projects').select('*').eq('company_id', id).order('sort_order'),
  ]);

  const portfolio = proxyPortfolioImages(rawPortfolio ?? []);

  if (!company) notFound();

  const isTh = lang === 'th';
  const displayName = isTh && company.name_th ? company.name_th : company.name;
  const displayDesc = isTh && company.description_th ? company.description_th : company.description;
  const initial = company.logo_initial ?? company.name.slice(0, 2).toUpperCase();
  const projects = portfolio;
  const bfx = (company as any).banner_focus_x ?? 50;
  const bfy = (company as any).banner_focus_y ?? 50;
  const bfmx = (company as any).banner_focus_mobile_x ?? 50;
  const bfmy = (company as any).banner_focus_mobile_y ?? 50;

  // The address field now holds a Google Maps URL. Older records may still hold
  // plain text — show a map for URLs, fall back to text for anything else.
  const mapLink: string | null = company.address && /^https?:\/\//i.test(company.address) ? company.address : null;
  const legacyAddress: string | null = company.address && !mapLink ? company.address : null;
  const mapEmbed = await mapEmbedSrc(mapLink);

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", minHeight: '100vh', background: '#F4F5F7' }}>
      <style>{`
        .pp-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
        .pp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .pp-cover { position: relative; width: 100%; max-width: 1200px; margin: 0 auto; padding-bottom: 38%; background: #0E1017; overflow: hidden; }
        .pp-banner-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
        .pp-identity { max-width: 960px; margin: 0 auto; padding: 0 24px; }
        .pp-idrow { display: flex; align-items: flex-start; gap: 20px; padding-top: 12px; position: relative; z-index: 2; flex-wrap: wrap; }
        .pp-idlogo { margin-top: -68px; }
        @media (max-width: 820px) {
          .pp-grid { grid-template-columns: 1fr; }
          .pp-stats { grid-template-columns: repeat(2, 1fr); }
        }
        .pp-banner-mobile { display: none; }
        @media (max-width: 768px) {
          .pp-cover { padding-bottom: 62%; }
          .pp-idrow { gap: 14px; padding-top: 8px; }
          .pp-idlogo { margin-top: -48px; }
          .pp-banner-desktop { display: none; }
          .pp-banner-mobile { display: block; }
        }
      `}</style>
      <PublicNav locale={lang} dict={dict} dark={false} />

      {/* Back link */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 24px 12px' }}>
        <Link href={`/${lang}/search-providers`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7385', textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          {isTh ? 'กลับไปค้นหา' : 'Back to search'}
        </Link>
      </div>

      {/* Cover — matches the framing chosen in the editor exactly */}
      <div className="pp-cover">
        {company.banner_url ? (
          <>
            <img className="pp-banner-img pp-banner-desktop" src={company.banner_url} alt="" style={{ objectPosition: `${bfx}% ${bfy}%` }} />
            <img className="pp-banner-img pp-banner-mobile" src={(company as any).banner_url_mobile || company.banner_url} alt="" style={{ objectPosition: (company as any).banner_url_mobile ? `${bfmx}% ${bfmy}%` : `${bfx}% ${bfy}%` }} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0E1017 0%, #0F6F73 100%)' }} />
        )}
      </div>

      {/* Identity */}
      <div className="pp-identity">
        <div className="pp-idrow">
          <div className="pp-idlogo" style={{ width: '96px', height: '96px', borderRadius: '22px', background: company.logo_url ? 'white' : '#0F6F73', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '28px', flexShrink: 0, border: '3px solid white', boxShadow: '0 4px 14px rgba(14,16,23,0.18)', overflow: 'hidden' }}>
            {company.logo_url ? (
              <img src={company.logo_url} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initial}
          </div>
          <div style={{ paddingBottom: '4px' }}>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, color: '#171A21', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              {displayName}
            </h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {company.verified && <span style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '999px' }}>✓ {isTh ? 'ยืนยันแล้ว' : 'Verified'}</span>}
              {company.premium && <span style={{ background: 'linear-gradient(135deg, #F77F00, #E06B00)', color: 'white', fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '999px' }}>✦ Premium</span>}
              {company.province && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6B7385' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{company.province}</span>}
              {company.industry && <span style={{ fontSize: '13px', color: '#9AA0AE' }}>· {company.industry}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '960px', margin: '24px auto 48px', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div className="pp-grid">

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>

            {/* Stats */}
            <div className="pp-stats">
              {[
                { val: company.views ?? 0, label: isTh ? 'การเข้าชม' : 'Views' },
                { val: company.services?.length ?? 0, label: isTh ? 'บริการ' : 'Services' },
                { val: projects.length, label: isTh ? 'ผลงาน' : 'Projects' },
                { val: company.founded_year ?? '—', label: isTh ? 'ก่อตั้ง' : 'Founded' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'white', borderRadius: '14px', border: '1px solid rgba(15,111,115,0.10)', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F6F73' }}>{String(s.val)}</div>
                  <div style={{ fontSize: '11px', color: '#9AA0AE', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* About */}
            {displayDesc && (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{isTh ? 'เกี่ยวกับ' : 'About'}</div>
                <p style={{ fontSize: '14px', color: '#444B5A', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{displayDesc}</p>
              </div>
            )}

            {/* Services */}
            {company.services?.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>{isTh ? 'บริการที่เสนอ' : 'Services Offered'}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {company.services.map((s: string) => (
                    <span key={s} style={{ background: '#F0F9F9', color: '#0F6F73', fontSize: '13px', fontWeight: 600, padding: '7px 16px', borderRadius: '999px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {projects.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>{isTh ? 'ผลงานที่ผ่านมา' : 'Portfolio'}</div>
                <PortfolioGrid
                  projects={projects}
                  contact={{ phone: company.phone ?? null, email: company.email ?? null, companyName: displayName }}
                  isTh={isTh}
                />
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Contact card */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#171A21', marginBottom: '14px' }}>{isTh ? 'ติดต่อผู้ให้บริการนี้' : 'Contact this provider'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {company.email && (
                  <a href={`mailto:${company.email}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#444B5A', fontSize: '13px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    {company.email}
                  </a>
                )}
                {company.phone && (
                  <a href={`tel:${company.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#444B5A', fontSize: '13px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {company.phone}
                  </a>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '1px solid #E4E7ED', borderRadius: '10px', textDecoration: 'none', color: '#444B5A', fontSize: '13px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {company.line_id && (
                  <LineContactRow raw={company.line_id} isTh={isTh} />
                )}
                {!company.email && !company.phone && !company.website && !company.line_id && (
                  <p style={{ fontSize: '13px', color: '#9AA0AE', textAlign: 'center', padding: '8px 0', margin: 0 }}>{isTh ? 'ยังไม่มีข้อมูลติดต่อ' : 'No contact info yet'}</p>
                )}
              </div>
              <button style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {isTh ? 'ส่งข้อความ' : 'Send Message'}
              </button>
            </div>

            {/* Company details */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>{isTh ? 'ข้อมูลบริษัท' : 'Company Details'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: isTh ? 'จังหวัด' : 'Province', val: company.province },
                  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: isTh ? 'ขนาดทีม' : 'Team Size', val: company.team_size },
                  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: isTh ? 'ก่อตั้งปี' : 'Founded', val: company.founded_year },
                  { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, label: isTh ? 'อุตสาหกรรม' : 'Industry', val: company.industry },
                ].filter(r => r.val).map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <div style={{ flexShrink: 0 }}>{row.icon}</div>
                    <span style={{ color: '#9AA0AE', minWidth: '70px' }}>{row.label}</span>
                    <span style={{ color: '#171A21', fontWeight: 500 }}>{String(row.val)}</span>
                  </div>
                ))}
                {legacyAddress && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6F73" strokeWidth="2" strokeLinecap="round" style={{ marginTop: '2px', flexShrink: 0 }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <span style={{ color: '#9AA0AE', minWidth: '70px' }}>{isTh ? 'ที่อยู่' : 'Address'}</span>
                    <span style={{ color: '#171A21', fontWeight: 500 }}>{legacyAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location map */}
            {(mapEmbed || mapLink) && (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>{isTh ? 'ที่ตั้ง' : 'Location'}</div>
                {mapEmbed && (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E4E7ED', marginBottom: '12px' }}>
                    <iframe
                      src={mapEmbed}
                      width="100%"
                      height={180}
                      style={{ border: 0, display: 'block' }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={isTh ? 'แผนที่บริษัท' : 'Company location map'}
                    />
                  </div>
                )}
                {mapLink && (
                  <a href={mapLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0F6F73', textDecoration: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {isTh ? 'ดูใน Google Maps' : 'View on Google Maps'}
                  </a>
                )}
              </div>
            )}

            {/* Broadcast CTA */}
            <div style={{ background: 'linear-gradient(135deg, #0B2B2C 0%, #0F6F73 100%)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>{isTh ? 'ต้องการเปรียบเทียบ?' : 'Want to compare?'}</div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '14px' }}>
                {isTh ? 'ประกาศคำขอและรับข้อเสนอจากผู้ให้บริการหลายราย' : 'Broadcast a request and get proposals from multiple providers.'}
              </p>
              <Link href={`/${lang}/broadcast-request`} style={{ display: 'block', padding: '10px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '13px', borderRadius: '10px', textDecoration: 'none', textAlign: 'center' }}>
                {isTh ? 'ประกาศคำขอ — ฟรี' : 'Broadcast Request — Free'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
