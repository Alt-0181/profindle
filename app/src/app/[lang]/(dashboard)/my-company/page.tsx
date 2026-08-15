import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { MyCompanyForm } from './company-form';

export default async function MyCompanyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .maybeSingle();

  function parseLineId(raw: string | null): { lineIdType: 'oa' | 'id' | 'phone'; lineIdValue: string } {
    if (!raw) return { lineIdType: 'id', lineIdValue: '' };
    if (raw.startsWith('oa:')) return { lineIdType: 'oa', lineIdValue: raw.slice(3) };
    if (raw.startsWith('id:')) return { lineIdType: 'id', lineIdValue: raw.slice(3) };
    if (raw.startsWith('phone:')) return { lineIdType: 'phone', lineIdValue: raw.slice(6) };
    return { lineIdType: 'id', lineIdValue: raw };
  }

  const lineIdParsed = parseLineId((company as any)?.line_id ?? null);
  const isTh = lang === 'th';
  // A claimed-but-unverified company is awaiting super-admin verification —
  // nudge the owner to upload their registration document.
  const pendingVerify = !!company && (company as any).claimed !== false && !(company as any).verified;

  const initialData = company ? {
    nameEn: company.name || company.name_th || '',
    nameTh: company.name_th ?? '',
    descEn: company.description ?? '',
    descTh: company.description_th ?? '',
    province: company.province ?? '',
    services: (company as any).services ?? [],
    address: company.address ?? '',
    teamSize: company.team_size ?? '',
    foundedYear: company.founded_year ?? '',
    website: company.website ?? '',
    phone: company.phone ?? '',
    emailPublic: company.email ?? '',
    dbdNo: company.dbd_no ?? '',
    lineIdType: lineIdParsed.lineIdType,
    lineIdValue: lineIdParsed.lineIdValue,
    dbdCertPath: company.dbd_certificate_url ?? null,
    dbdCertName: (company as any).dbd_certificate_name ?? null,
    logoUrl: (company as any).logo_url ?? null,
    bannerUrl: (company as any).banner_url ?? null,
    bannerMobileUrl: (company as any).banner_url_mobile ?? null,
    bannerFocusX: (company as any).banner_focus_x ?? 50,
    bannerFocusY: (company as any).banner_focus_y ?? 50,
    bannerFocusMobileX: (company as any).banner_focus_mobile_x ?? 50,
    bannerFocusMobileY: (company as any).banner_focus_mobile_y ?? 50,
    buyerOnly: (company as any).buyer_only ?? false,
  } : undefined;

  return (
    <div className="page-body">
      <div style={{ maxWidth: '840px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{dict.myCompany.title}</h1>
          <p style={{ fontSize: '14px', color: '#6B7385' }}>{dict.myCompany.subtitle}</p>
        </div>
        {pendingVerify && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#FFF6EC', border: '1px solid rgba(247,127,0,0.25)', borderRadius: '14px', padding: '16px 18px', marginBottom: '24px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F77F00" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#171A21', marginBottom: '3px' }}>{isTh ? 'รอการยืนยัน' : 'Pending verification'}</div>
              <div style={{ fontSize: '13px', color: '#6B7385', lineHeight: 1.6 }}>
                {isTh
                  ? 'อัปโหลดหนังสือรับรองการจดทะเบียนบริษัท (DBD) ในส่วน “การยืนยัน” ด้านล่าง แล้วกดบันทึก ทีมงานจะตรวจสอบและติดเครื่องหมายยืนยันให้'
                  : 'Upload your company registration (DBD) document in the “Verification” section below and save. Our team will review it and add your Verified badge.'}
              </div>
            </div>
          </div>
        )}
        <MyCompanyForm lang={lang} dict={dict} initialData={initialData} />
      </div>
    </div>
  );
}
