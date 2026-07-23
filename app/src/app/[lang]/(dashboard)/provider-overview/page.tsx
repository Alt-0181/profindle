import { notFound } from 'next/navigation';
import Link from 'next/link';
import { hasLocale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';

export default async function ProviderOverviewPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: company } = await supabase
    .from('companies')
    .select('id, services, views')
    .eq('user_id', user?.id ?? '')
    .maybeSingle();

  const { count: matchCount } = company
    ? await supabase
        .from('broadcast_matches')
        .select('id', { count: 'exact', head: true })
        .eq('provider_company_id', company.id)
    : { count: 0 };

  const services: string[] = company?.services ?? [];
  const totalViews = company?.views ?? 0;
  const totalInquiries = matchCount ?? 0;

  const isTh = lang === 'th';
  const t = {
    title: isTh ? 'ภาพรวมผู้ให้บริการ' : 'Provider Overview',
    subtitle: isTh ? 'บริการและผลงานของคุณ' : 'Your services and performance',
    manageServices: isTh ? 'จัดการบริการ' : 'Manage Services',
    views: isTh ? 'การเข้าชม' : 'Profile Views',
    inquiries: isTh ? 'คำขอที่ได้รับ' : 'Broadcast Matches',
    activeServices: isTh ? 'บริการที่ใช้งาน' : 'Active Services',
    total: isTh ? 'รวม' : 'total',
    servicesLabel: isTh ? 'บริการของคุณ' : 'Your Services',
    noServices: isTh ? 'ยังไม่ได้เพิ่มบริการ' : 'No services added yet',
    noServicesSub: isTh ? 'ไปที่ My Company เพื่อเพิ่มบริการของคุณ' : 'Go to My Company to add your services',
    goToProfile: isTh ? 'แก้ไขโปรไฟล์' : 'Edit Profile',
  };

  return (
    <div className="page-body">
      <style>{`
        .po-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
        .po-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        @media (max-width: 640px) {
          .po-head { flex-direction: column; align-items: stretch; }
          .po-head-btn { text-align: center; }
          .po-kpis { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="po-head">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{t.title}</h1>
          <p style={{ fontSize: '14px', color: '#6B7385' }}>{t.subtitle}</p>
        </div>
        <Link
          href={`/${lang}/my-company`}
          className="po-head-btn"
          style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none', display: 'inline-block', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {t.manageServices}
        </Link>
      </div>

      {/* KPIs */}
      <div className="po-kpis">
        {[
          { label: t.views, value: totalViews, sub: isTh ? 'ทั้งหมด' : 'all time' },
          { label: t.inquiries, value: totalInquiries, sub: isTh ? 'ทั้งหมด' : 'all time' },
          { label: t.activeServices, value: services.length, sub: t.total },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', padding: '20px 24px' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: '#171A21', marginBottom: '4px' }}>{kpi.value}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#444B5A' }}>{kpi.label}</div>
            <div style={{ fontSize: '12px', color: '#9AA0AE', marginTop: '2px' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Services list */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(15,111,115,0.10)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #F4F5F7' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#171A21' }}>{t.servicesLabel}</span>
        </div>

        {services.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#444B5A', marginBottom: '6px' }}>{t.noServices}</p>
            <p style={{ fontSize: '13px', color: '#9AA0AE', marginBottom: '20px' }}>{t.noServicesSub}</p>
            <Link
              href={`/${lang}/my-company`}
              style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0F6F73, #1A9DA3)', color: 'white', fontWeight: 600, fontSize: '14px', borderRadius: '12px', textDecoration: 'none', display: 'inline-block' }}
            >
              {t.goToProfile}
            </Link>
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {services.map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderTop: i > 0 ? '1px solid #F4F5F7' : undefined }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#171A21' }}>{name}</span>
                <Link
                  href={`/${lang}/my-company`}
                  style={{ padding: '6px 14px', background: 'transparent', border: '1.5px solid #E4E7ED', color: '#444B5A', fontSize: '12px', fontWeight: 600, borderRadius: '8px', textDecoration: 'none' }}
                >
                  {isTh ? 'แก้ไข' : 'Edit'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
