import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { hasLocale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { ScrubButton } from './scrub-button';

export default async function AdminReportsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'super_admin') redirect(`/${lang}/home`);

  // Search demand data (service-role read; table may not exist pre-migration).
  const admin = adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data: searchLogs } = await admin
    .from('search_logs')
    .select('q, where_info, province, result_count, created_at')
    .order('created_at', { ascending: false })
    .limit(5000);

  type Log = { q: string | null; where_info: string | null; province: string | null; result_count: number };
  const logs: Log[] = (searchLogs as Log[]) ?? [];
  const label = (l: Log) => [l.q, l.where_info].filter(Boolean).join(' · ') || '(empty)';
  const tally = (rows: Log[]) => {
    const m = new Map<string, number>();
    for (const r of rows) m.set(label(r), (m.get(label(r)) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const totalSearches = logs.length;
  const noResult = logs.filter((l) => (l.result_count ?? 0) === 0);
  const topNoResult = tally(noResult).slice(0, 15);
  const topSearches = tally(logs).slice(0, 15);

  const isTh = lang === 'th';
  const t = {
    title: isTh ? 'รายงาน' : 'Reports',
    subtitle: isTh ? 'ดาวน์โหลดข้อมูลเป็นไฟล์ Excel (ข้อมูลทั้งหมด)' : 'Download data as Excel workbooks (all-time)',
    back: isTh ? '← กลับไปหน้าแอดมิน' : '← Back to Admin',
    r1title: isTh ? 'รายงานประสิทธิภาพบริษัท' : 'Company Performance',
    r1desc: isTh
      ? 'สามแท็บ: (A) สรุปรายบริษัท — ยอดเข้าชม ความสนใจติดต่อแยกตามช่องทาง งานที่จับคู่ สถานะ ช่วงวันที่เข้าชม (B) ประสิทธิภาพบริการ (C) ประสิทธิภาพผลงาน'
      : 'Three tabs: (A) Company Summary — views, contact intent by channel, broadcast matches, status, view date range; (B) Service Performance; (C) Portfolio Performance.',
    r2title: isTh ? 'ข้อมูลผู้ใช้และบริษัท' : 'User & Company Master',
    r2desc: isTh
      ? 'ข้อมูล CRM: บริษัททั้งหมด (พร้อมอีเมลเจ้าของ) และบัญชีผู้ใช้ทั้งหมด สองแท็บในไฟล์เดียว'
      : 'CRM export: all companies (with owner email) and all user accounts — two tabs in one workbook.',
    download: isTh ? 'ดาวน์โหลด .xlsx' : 'Download .xlsx',
    note: isTh
      ? 'หมายเหตุ: ไม่นับกิจกรรมจาก support@profindle.com, ซูเปอร์แอดมิน และการดูโปรไฟล์ของตัวเอง รายงานนี้ไม่รวมเอกสาร DBD หรือข้อมูลด้านความปลอดภัย'
      : 'Note: activity from support@profindle.com, super-admins, and self-views is excluded. These reports never include DBD documents or security data.',
    hygieneTitle: isTh ? 'ความเป็นส่วนตัวของข้อมูล (PDPA)' : 'Data hygiene (PDPA)',
    hygieneDesc: isTh
      ? 'ลบข้อมูลติดต่อส่วนบุคคล (มือถือ, อีเมลชื่อบุคคล, LINE ส่วนตัว) ออกจากโปรไฟล์ที่ยังไม่ยืนยัน เก็บเฉพาะช่องทางองค์กร (เบอร์สำนักงาน, info@, LINE OA) และเว็บไซต์ ไม่แตะโปรไฟล์ที่ยืนยันแล้ว'
      : 'Remove personal contact (mobile, named-person email, personal LINE) from unclaimed profiles. Keeps only organizational channels (office line, info@, LINE OA) and the website. Claimed profiles are never touched.',
  };

  const cardStyle: React.CSSProperties = {
    background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px',
  };
  const btnStyle: React.CSSProperties = {
    marginTop: '6px', padding: '10px 20px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none', display: 'inline-block', alignSelf: 'flex-start',
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '20px' }}>
        <Link href={`/${lang}/admin`} style={{ fontSize: '13px', color: '#0F6F73', fontWeight: 600, textDecoration: 'none' }}>{t.back}</Link>
      </div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.title}</h1>
      <p style={{ fontSize: '14px', color: '#6B7385', marginBottom: '24px' }}>{t.subtitle}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21' }}>{t.r1title}</div>
          <div style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.5 }}>{t.r1desc}</div>
          <a href={`/api/admin/reports?type=company`} style={btnStyle}>{t.download}</a>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21' }}>{t.r2title}</div>
          <div style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.5 }}>{t.r2desc}</div>
          <a href={`/api/admin/reports?type=user`} style={btnStyle}>{t.download}</a>
        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#9AA0AE', lineHeight: 1.5, maxWidth: '640px' }}>{t.note}</p>

      {/* Search Insights — the demand radar */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{isTh ? 'ข้อมูลการค้นหา (ความต้องการของผู้ซื้อ)' : 'Search Insights (buyer demand)'}</h2>
        <p style={{ fontSize: '13px', color: '#6B7385', marginBottom: '16px', maxWidth: '640px' }}>
          {isTh
            ? 'สิ่งที่ผู้ซื้อค้นหา โดยเฉพาะการค้นหาที่ไม่พบผลลัพธ์ — ใช้ตัดสินใจว่าจะเพิ่มผู้ให้บริการหมวดใดต่อไป'
            : 'What buyers search for — especially searches that found nothing. Use the “No results” list to decide which providers to add next.'}
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ ...cardStyle, padding: '16px 20px', flexDirection: 'row', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#0F6F73' }}>{totalSearches}</span>
            <span style={{ fontSize: '13px', color: '#9AA0AE' }}>{isTh ? 'การค้นหาทั้งหมด' : 'total searches'}</span>
          </div>
          <div style={{ ...cardStyle, padding: '16px 20px', flexDirection: 'row', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#F77F00' }}>{noResult.length}</span>
            <span style={{ fontSize: '13px', color: '#9AA0AE' }}>{isTh ? 'ไม่พบผลลัพธ์' : 'found nothing'}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {/* No-result searches = unmet demand */}
          <div style={{ ...cardStyle, gap: '0', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7', fontSize: '14px', fontWeight: 700, color: '#F77F00' }}>
              🔴 {isTh ? 'ค้นหาแล้วไม่พบ (ความต้องการที่ยังไม่มีผู้ให้บริการ)' : 'No results — unmet demand'}
            </div>
            {topNoResult.length === 0 ? (
              <div style={{ padding: '20px', fontSize: '13px', color: '#9AA0AE' }}>{isTh ? 'ยังไม่มีข้อมูล' : 'No data yet.'}</div>
            ) : topNoResult.map(([term, n], i) => (
              <div key={term} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 20px', borderTop: i > 0 ? '1px solid #F4F5F7' : undefined, fontSize: '13px' }}>
                <span style={{ color: '#171A21', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{term}</span>
                <span style={{ fontWeight: 700, color: '#F77F00', flexShrink: 0 }}>{n}×</span>
              </div>
            ))}
          </div>

          {/* Top searches overall */}
          <div style={{ ...cardStyle, gap: '0', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7', fontSize: '14px', fontWeight: 700, color: '#0F6F73' }}>
              🔎 {isTh ? 'ค้นหาบ่อยที่สุด' : 'Top searches'}
            </div>
            {topSearches.length === 0 ? (
              <div style={{ padding: '20px', fontSize: '13px', color: '#9AA0AE' }}>{isTh ? 'ยังไม่มีข้อมูล' : 'No data yet.'}</div>
            ) : topSearches.map(([term, n], i) => (
              <div key={term} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 20px', borderTop: i > 0 ? '1px solid #F4F5F7' : undefined, fontSize: '13px' }}>
                <span style={{ color: '#171A21', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{term}</span>
                <span style={{ fontWeight: 700, color: '#0F6F73', flexShrink: 0 }}>{n}×</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data hygiene / PDPA cleanup */}
      <div style={{ ...cardStyle, marginTop: '28px', maxWidth: '640px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#171A21' }}>{t.hygieneTitle}</div>
        <div style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.5 }}>{t.hygieneDesc}</div>
        <div style={{ marginTop: '6px' }}>
          <ScrubButton isTh={isTh} />
        </div>
      </div>
    </div>
  );
}
