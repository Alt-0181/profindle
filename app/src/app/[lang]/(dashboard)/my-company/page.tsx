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
    .select('name, name_th, description, description_th, industry, province, address, team_size, founded_year, website, phone, email')
    .eq('user_id', user?.id ?? '')
    .maybeSingle();

  const initialData = company ? {
    nameEn: company.name ?? '',
    nameTh: company.name_th ?? '',
    descEn: company.description ?? '',
    descTh: company.description_th ?? '',
    industry: company.industry ?? '',
    province: company.province ?? '',
    address: company.address ?? '',
    teamSize: company.team_size ?? '',
    foundedYear: company.founded_year ?? '',
    website: company.website ?? '',
    phone: company.phone ?? '',
    emailPublic: company.email ?? '',
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
