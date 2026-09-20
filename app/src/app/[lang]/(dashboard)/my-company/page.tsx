import { notFound } from 'next/navigation';
import { getDictionary, hasLocale, type Locale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { MyCompanyForm } from './company-form';
import { PortfolioClient } from '../portfolio/portfolio-client';
import { resolveCompanyAccess } from '@/lib/company-access';
import { getAdmin } from '@/lib/collab-access';

export default async function MyCompanyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Resolve the company the user manages — their own, or one they collaborate
  // on — plus what they're allowed to edit.
  const access = await resolveCompanyAccess(supabase, user?.id, '*');
  const company = access.company;

  function parseLineId(raw: string | null): { lineIdType: 'oa' | 'id' | 'phone'; lineIdValue: string } {
    if (!raw) return { lineIdType: 'id', lineIdValue: '' };
    if (raw.startsWith('oa:')) return { lineIdType: 'oa', lineIdValue: raw.slice(3) };
    if (raw.startsWith('id:')) return { lineIdType: 'id', lineIdValue: raw.slice(3) };
    if (raw.startsWith('phone:')) return { lineIdType: 'phone', lineIdValue: raw.slice(6) };
    return { lineIdType: 'id', lineIdValue: raw };
  }

  const lineIdParsed = parseLineId((company as any)?.line_id ?? null);
  const isTh = lang === 'th';

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

  // Portfolio is embedded on this page so providers add their work in the same
  // flow as their company info (one page). Projects need a saved company first.
  const companyId = company?.id ?? null;
  const companyServices: string[] = (company as any)?.services ?? [];
  // A user with no company yet is a prospective owner creating their first one —
  // they must be able to edit and add a portfolio. Only a collaborator on an
  // EXISTING company is gated by the permissions they were granted.
  const canEditCompany = !companyId || access.canEditCompany;
  const canEditPortfolio = !companyId || access.canEditPortfolio;

  // Header shows WHICH company you're managing and your role, so collaborators
  // (and owners with several hats) always know whose profile they're editing.
  const userName: string = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || '';
  const companyDisplayName = company
    ? (isTh ? ((company as any).name_th || company.name) : (company.name || (company as any).name_th))
    : '';
  const roleLabel = access.isMember
    ? (isTh ? 'ผู้ร่วมจัดการ' : 'Collaborator')
    : (isTh ? 'เจ้าของ' : 'Owner');
  const headerTitle = companyDisplayName || dict.myCompany.title;
  const headerSubtitle = userName ? `${userName} · ${roleLabel}` : dict.myCompany.subtitle;

  // Owner: how many collaborator changes are waiting for approval (so they get
  // nudged here, not only inside Settings).
  const pendingCount = (!access.isMember && companyId)
    ? ((await getAdmin()
        .from('company_change_requests')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'pending')).count ?? 0)
    : 0;
  const { data: projectRows } = companyId
    ? await supabase
        .from('portfolio_projects')
        .select('id, title, client, confidential, year, budget, category, description, description_th, results, results_th, challenge, challenge_th, images, services')
        .eq('company_id', companyId)
        .order('sort_order', { ascending: true })
    : { data: [] };
  const initialProjects = (projectRows ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    client: p.client ?? '',
    confidential: p.confidential ?? false,
    year: p.year ? String(p.year) : '',
    budget: p.budget ?? '',
    category: p.category ?? '',
    descEn: p.description ?? '',
    descTh: p.description_th ?? '',
    resultsEn: p.results ?? '',
    resultsTh: p.results_th ?? '',
    challengeEn: p.challenge ?? '',
    challengeTh: p.challenge_th ?? '',
    images: p.images ?? [],
    services: p.services ?? [],
  }));

  return (
    <div className="page-body">
      <div style={{ maxWidth: '840px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#171A21', marginBottom: '4px' }}>{headerTitle}</h1>
          <p style={{ fontSize: '14px', color: '#6B7385' }}>{headerSubtitle}</p>
        </div>
        {pendingCount > 0 && (
          <Link href={`/${lang}/settings?section=team`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', background: '#FFFBF3', border: '1.5px solid #F3D9A4', borderRadius: '14px', padding: '12px 16px', marginBottom: '20px' }}>
            <span style={{ fontSize: '18px' }}>📝</span>
            <div style={{ flex: 1, fontSize: '13px', color: '#8A5A12', fontWeight: 600 }}>
              {isTh
                ? `มีการเปลี่ยนแปลงจากผู้ร่วมจัดการ ${pendingCount} รายการรออนุมัติ — กดเพื่อตรวจสอบ`
                : `${pendingCount} collaborator change${pendingCount > 1 ? 's' : ''} awaiting your approval — tap to review`}
            </div>
            <span style={{ fontSize: '16px', color: '#B4791E' }}>›</span>
          </Link>
        )}
        {access.isMember && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F0F9F9', border: '1px solid rgba(15,111,115,0.18)', borderRadius: '14px', padding: '12px 16px', marginBottom: '20px' }}>
            <span style={{ fontSize: '18px' }}>👥</span>
            <div style={{ fontSize: '13px', color: '#0F6F73', fontWeight: 600 }}>
              {isTh ? 'คุณเป็นผู้ร่วมจัดการบริษัทนี้' : 'You’re a collaborator on this company'}
              {!access.canEditCompany && (isTh ? ' · ดูข้อมูลบริษัทได้อย่างเดียว' : ' · company info is view-only')}
            </div>
          </div>
        )}
        {/* Portfolio is passed as a slot so it renders between the company
            fields and the Save bar — Save comes after the portfolio. */}
        <MyCompanyForm
          lang={lang} dict={dict} initialData={initialData} canEdit={canEditCompany}
          canEditName={!access.isMember}
          isMember={access.isMember} companyId={companyId}
          companyExists={!!companyId} portfolioCount={initialProjects.length}
          showInvite={!access.isMember}
          portfolioSlot={
            <div style={{ marginTop: '36px', paddingTop: '28px', borderTop: '1px solid #EEF1F2' }}>
              <PortfolioClient lang={lang} dict={dict} companyId={companyId} companyServices={companyServices} initialProjects={initialProjects} canEdit={canEditPortfolio} isMember={access.isMember} requireApproval={!!(company as any)?.require_approval} />
            </div>
          }
        />
      </div>
    </div>
  );
}
