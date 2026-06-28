import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function BroadcastDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, supabase] = await Promise.all([
    getDictionary(lang as Locale),
    createClient(),
  ]);

  const { data: broadcast } = await supabase
    .from('broadcasts')
    .select('*, companies:buyer_company_id(name, name_th, phone, email, website, line_id)')
    .eq('id', id)
    .maybeSingle();

  if (!broadcast) notFound();

  const isTh = lang === 'th';
  const buyer = (broadcast as any).companies;
  const buyerName = isTh && buyer?.name_th ? buyer.name_th : buyer?.name ?? '—';
  const description = isTh && broadcast.description_th ? broadcast.description_th : broadcast.description_en;

  const rows = [
    { label: isTh ? 'บริการที่ต้องการ' : 'Service Needed', value: broadcast.category },
    ...(broadcast.title ? [{ label: isTh ? 'ชื่อโปรเจกต์' : 'Project Title', value: broadcast.title }] : []),
    { label: isTh ? 'งบประมาณ' : 'Budget', value: broadcast.budget_band ?? '—' },
    { label: isTh ? 'วันที่ส่งมอบบริการ' : 'Service Delivered Date', value: broadcast.timeline ?? '—' },
    ...(broadcast.location_pref ? [{ label: isTh ? 'สถานที่' : 'Location', value: broadcast.location_pref }] : []),
    { label: isTh ? 'จากบริษัท' : 'From', value: buyerName },
    { label: isTh ? 'โพสต์เมื่อ' : 'Posted', value: new Date(broadcast.created_at).toLocaleDateString(isTh ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif", minHeight: '100vh', background: '#F4F5F7' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0B2B2C, #0F6F73)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href={`/${lang}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
          Profindle
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>/</span>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>
          {isTh ? 'คำขอบริการ' : 'Broadcast Request'}
        </span>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0F9F9', border: '1px solid #2BBEC5', color: '#0F6F73', fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '999px', marginBottom: '16px' }}>
          <span>📢</span>
          {isTh ? 'คำขอบริการใหม่' : 'New Broadcast Request'}
        </div>

        {/* Service title */}
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#171A21', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          {broadcast.category}
        </h1>
        {broadcast.title && (
          <p style={{ fontSize: '16px', color: '#444B5A', fontWeight: 500, marginBottom: '20px' }}>{broadcast.title}</p>
        )}

        {/* Description */}
        {description && (
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E4E7ED', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9AA0AE', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
              {isTh ? 'รายละเอียดโปรเจกต์' : 'Project Description'}
            </div>
            <p style={{ fontSize: '14px', color: '#444B5A', lineHeight: 1.75, margin: 0 }}>{description}</p>
          </div>
        )}

        {/* Detail rows */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E4E7ED', overflow: 'hidden', marginBottom: '24px' }}>
          {rows.map((row, i) => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px', padding: '14px 20px', borderBottom: i < rows.length - 1 ? '1px solid #F4F5F7' : 'none' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9AA0AE', paddingTop: '1px' }}>{row.label}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E4E7ED', padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>
            {isTh ? 'สนใจรับงานนี้?' : 'Interested in this project?'}
          </div>
          <div style={{ fontSize: '13px', color: '#6B7385', marginBottom: '16px', lineHeight: 1.6 }}>
            {isTh
              ? 'ติดต่อผู้ว่าจ้างโดยตรงผ่านช่องทางด้านล่าง'
              : 'Reach out to the buyer directly through the channels below.'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {buyer?.email && (
              <a href={`mailto:${buyer.email}?subject=Re: ${broadcast.category} Request&body=Hi ${buyerName},%0D%0A%0D%0AI saw your broadcast request for ${broadcast.category} on Profindle and I'd love to help.`}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 7 12 13 2 7"/></svg>
                {isTh ? 'ตอบกลับทาง Email' : 'Reply via Email'}
              </a>
            )}
            {buyer?.phone && (
              <a href={`tel:${buyer.phone.replace(/\s/g, '')}`}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: '#F0F9F9', color: '#0F6F73', border: '1.5px solid #2BBEC5', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.92 3.38C1.86 2.58 2.42 2 3.22 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.15 6.15l1.48-1.48a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {isTh ? 'โทรหาผู้ว่าจ้าง' : 'Call the Buyer'} · {buyer.phone}
              </a>
            )}
            {buyer?.line_id && (
              <a href={`https://line.me/R/ti/p/${encodeURIComponent(buyer.line_id)}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: '#06C755', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.365 9.89c.50 0 .866.37.866.87s-.368.87-.866.87H17.61v1.05h1.754c.498 0 .866.37.866.87s-.368.87-.866.87H16.74a.87.87 0 0 1-.866-.87V8.14c0-.498.368-.868.866-.868h2.624c.498 0 .866.37.866.87s-.368.87-.866.87H17.61v.878h1.754zm-6.735 3.65a.868.868 0 0 1-.607-.247l-2.627-2.78v2.16a.866.866 0 1 1-1.732 0V8.14a.866.866 0 0 1 1.474-.618l2.627 2.78V8.14a.866.866 0 1 1 1.732 0v5.4a.868.868 0 0 1-.866.868v.002zm-5.74 0a.866.866 0 0 1-.866-.868V8.14a.866.866 0 1 1 1.732 0v5.4a.866.866 0 0 1-.866.868v-.002zM24 10.314C24 4.943 18.617.572 12 .572S0 4.943 0 10.314c0 4.814 4.27 8.842 10.035 9.608.392.084.923.258 1.058.592.12.302.079.776.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.07 9.436-6.966C23.176 14.143 24 12.33 24 10.314z"/></svg>
                {isTh ? 'ติดต่อผ่าน LINE' : 'Contact via LINE'}
              </a>
            )}
            {!buyer?.email && !buyer?.phone && !buyer?.line_id && (
              <Link href={`/${lang}/signup`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 16px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                {isTh ? 'สมัครสมาชิกเพื่อดูข้อมูลติดต่อ' : 'Sign up to view contact details'}
              </Link>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9AA0AE', marginTop: '24px' }}>
          {isTh ? 'คำขอนี้ส่งผ่าน ' : 'This request was sent via '}
          <Link href={`/${lang}`} style={{ color: '#0F6F73', textDecoration: 'none', fontWeight: 600 }}>Profindle</Link>
        </p>
      </div>
    </div>
  );
}
