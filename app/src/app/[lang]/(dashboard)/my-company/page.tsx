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
    .select('name, name_th, description, description_th, industry, province, address, team_size, founded_year, website, phone, email, line_id, dbd_certificate_url, dbd_certificate_name, services, logo_url, banner_url, banner_focus_x, banner_focus_y, banner_focus_mobile_x, banner_focus_mobile_y, buyer_only')
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

  const initialData = company ? {
    nameEn: company.name ?? '',
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
    lineIdType: lineIdParsed.lineIdType,
    lineIdValue: lineIdParsed.lineIdValue,
    dbdCertPath: company.dbd_certificate_url ?? null,
    dbdCertName: (company as any).dbd_certificate_name ?? null,
    logoUrl: (company as any).logo_url ?? null,
    bannerUrl: (company as any).banner_url ?? null,
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
        <MyCompanyForm lang={lang} dict={dict} initialData={initialData} />
      </div>
    </div>
  );
}
