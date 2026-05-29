import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { MyCompanyForm } from './company-form';

export default async function MyCompanyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="page-body">
      <div style={{ maxWidth: '840px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{dict.myCompany.title}</h1>
          <p style={{ fontSize: '14px', color: '#6B7385' }}>{dict.myCompany.subtitle}</p>
        </div>
        <MyCompanyForm lang={lang} dict={dict} />
      </div>
    </div>
  );
}
