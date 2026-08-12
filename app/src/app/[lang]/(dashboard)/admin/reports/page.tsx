import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { hasLocale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';

export default async function AdminReportsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'super_admin') redirect(`/${lang}/home`);

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
    </div>
  );
}
