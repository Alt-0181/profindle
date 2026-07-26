import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INDUSTRIES } from '@/lib/services';

// ── Types ───────────────────────────────────────────────────────────────────
type PortfolioRow = {
  company_id: string;
  title: string | null;
  description: string | null;
  description_th: string | null;
  results: string | null;
  results_th: string | null;
  category: string | null;
  client: string | null;
  confidential: boolean | null;
  images: string[] | null;
  sort_order: number | null;
};

type CompanyRow = {
  id: string;
  name: string;
  name_th: string | null;
  description: string | null;
  description_th: string | null;
  province: string | null;
  services: string[] | null;
  verified: boolean;
  premium: boolean;
  views: number;
  logo_initial: string | null;
  logo_url: string | null;
};

function proxyImage(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/portfolio-images\/(.+?)(?:\?|$)/);
  if (!match) return url;
  const vMatch = url.match(/[?&]v=(\d+)/);
  return `/api/portfolio-image?path=${encodeURIComponent(match[1])}${vMatch ? `&v=${vMatch[1]}` : ''}`;
}

// Fisher–Yates shuffle. Randomness is the point: among equally-relevant
// providers, no one gets a permanent top spot — money never buys rank.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(request: NextRequest) {
  let service = '';
  let keyword = '';
  let lang = 'en';
  try {
    const body = await request.json();
    service = typeof body.service === 'string' ? body.service.trim() : '';
    keyword = typeof body.keyword === 'string' ? body.keyword.trim() : '';
    lang = body.lang === 'th' ? 'th' : 'en';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!service) return NextResponse.json({ error: 'A service is required.' }, { status: 400 });

  const supabase = await createClient();

  // Same-industry sibling services — used to fall back gracefully when nobody
  // offers the exact service yet (common while the marketplace is filling up).
  const industry = INDUSTRIES.find((i) => i.services.includes(service));
  const siblings = industry ? industry.services : [service];
  const industryName = industry ? (lang === 'th' ? industry.th : industry.name) : '';

  // Relevance gate: providers offering the exact service OR any sibling in the
  // same industry. `overlaps` => Postgres array `&&` (shares any element).
  const { data: companyData, error: cErr } = await supabase
    .from('companies')
    .select('id, name, name_th, description, description_th, province, services, verified, premium, views, logo_initial, logo_url')
    .overlaps('services', siblings);

  if (cErr) {
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 502 });
  }
  const all = (companyData ?? []).filter((c): c is CompanyRow => !!c.name);
  const exact = all.filter((c) => (c.services ?? []).includes(service));

  // Prefer exact-service providers; only fall back to the wider industry pool
  // when nobody offers the exact service. Headline count reflects EXACT only.
  const industryFallback = exact.length === 0 && all.length > 0;
  const basePool = exact.length > 0 ? exact : all;

  if (basePool.length === 0) {
    return NextResponse.json({ service, industry: industryName, count: 0, exactCount: 0, industryFallback: false, top: [], more: [], keywordRelaxed: false });
  }

  // Portfolios for the pool in one query.
  const ids = basePool.map((c) => c.id);
  const { data: pfData } = await supabase
    .from('portfolio_projects')
    .select('company_id, title, description, description_th, results, results_th, category, client, confidential, images, sort_order')
    .in('company_id', ids);
  const portfolios = (pfData ?? []) as PortfolioRow[];
  const pfByCompany = new Map<string, PortfolioRow[]>();
  for (const p of portfolios) {
    const list = pfByCompany.get(p.company_id) ?? [];
    list.push(p);
    pfByCompany.set(p.company_id, list);
  }

  const kw = keyword.toLowerCase();

  type Scored = {
    company: CompanyRow;
    exactMatch: boolean;
    bestProject: PortfolioRow | null;
    score: number;
    hasPortfolio: boolean;
  };

  const scored: Scored[] = basePool.map((company) => {
    const projects = (pfByCompany.get(company.id) ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const exactMatch = (company.services ?? []).includes(service);
    let score = 0;
    let bestProject: PortfolioRow | null = projects[0] ?? null;

    if (!kw) {
      score = 1;
    } else {
      const companyBlob = [company.name, company.name_th, company.description, company.description_th, ...(company.services ?? [])]
        .filter(Boolean).join(' ').toLowerCase();
      const matching = projects.filter((p) => {
        const blob = [p.title, p.description, p.description_th, p.results, p.results_th, p.category, p.confidential ? '' : p.client]
          .filter(Boolean).join(' ').toLowerCase();
        return blob.includes(kw);
      });
      if (matching.length > 0) { score = 2; bestProject = matching[0]; }
      else if (companyBlob.includes(kw)) { score = 1; }
      else { score = 0; }
    }
    return { company, exactMatch, bestProject, score, hasPortfolio: projects.length > 0 };
  });

  // Keyword given but nothing matched → relax (never dead-end) and flag it.
  let pool = scored;
  let keywordRelaxed = false;
  if (kw) {
    const hits = scored.filter((s) => s.score > 0);
    if (hits.length > 0) pool = hits;
    else { keywordRelaxed = true; pool = scored.map((s) => ({ ...s, score: 1 })); }
  }

  // Rank: keyword relevance → exact service → merit (portfolio, verified) →
  // random within the bucket. Merit is effort, never payment.
  const ranked = shuffle(pool).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.exactMatch !== b.exactMatch) return a.exactMatch ? -1 : 1;
    if (a.hasPortfolio !== b.hasPortfolio) return a.hasPortfolio ? -1 : 1;
    if (a.company.verified !== b.company.verified) return a.company.verified ? -1 : 1;
    return 0;
  });

  const localize = (en: string | null, th: string | null) => (lang === 'th' && th ? th : en) ?? '';

  const top = ranked.slice(0, 3).map((s) => {
    const p = s.bestProject;
    const images = (p?.images ?? []).map(proxyImage).filter((u): u is string => !!u).slice(0, 3);
    return {
      id: s.company.id,
      name: localize(s.company.name, s.company.name_th) || s.company.name,
      verified: s.company.verified,
      premium: s.company.premium,
      province: s.company.province,
      logoInitial: s.company.logo_initial ?? s.company.name.slice(0, 2).toUpperCase(),
      logoUrl: s.company.logo_url,
      project: p ? {
        title: p.title ?? '',
        description: localize(p.description, p.description_th),
        results: localize(p.results, p.results_th),
        category: p.category ?? '',
        client: p.confidential ? null : p.client,
        images,
      } : null,
    };
  });

  const more = ranked.slice(3).map((s) => ({
    id: s.company.id,
    name: localize(s.company.name, s.company.name_th) || s.company.name,
    verified: s.company.verified,
    province: s.company.province,
  }));

  return NextResponse.json({
    service,
    industry: industryName,
    count: exact.length,
    exactCount: exact.length,
    industryFallback,
    top,
    more,
    keywordRelaxed,
  });
}
