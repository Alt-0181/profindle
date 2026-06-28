import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { BroadcastCta } from './broadcast-cta';

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

        {/* CTA with tracking */}
        <BroadcastCta
          broadcastId={broadcast.id}
          lang={lang}
          category={broadcast.category}
          buyer={buyer}
          buyerName={buyerName}
          signupHref={`/${lang}/signup`}
        />

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9AA0AE', marginTop: '24px' }}>
          {isTh ? 'คำขอนี้ส่งผ่าน ' : 'This request was sent via '}
          <Link href={`/${lang}`} style={{ color: '#0F6F73', textDecoration: 'none', fontWeight: 600 }}>Profindle</Link>
        </p>
      </div>
    </div>
  );
}
