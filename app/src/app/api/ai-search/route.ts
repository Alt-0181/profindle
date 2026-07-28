import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { INDUSTRIES, SERVICES } from '@/lib/services';

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

// Fisher–Yates: random within a relevance bucket so no one gets a permanent top spot.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SERVICE_LABELS = SERVICES.map((s) => s.label);

// Use Claude to turn free text (Thai or English) into one catalog service + an
// English keyword. Falls back to a naive local match if the model is unavailable.
async function interpretQuery(query: string): Promise<{ service: string; keyword: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const schema = {
        type: 'object',
        additionalProperties: false,
        properties: {
          service: { type: 'string', enum: [...SERVICE_LABELS, ''], description: 'The single closest service label, or "" if none fits.' },
          keyword: { type: 'string', description: 'Extra specifics (industry, client type, tech, use-case) in ENGLISH for matching. "" if none.' },
        },
        required: ['service', 'keyword'],
      };
      const prompt = `A user is searching a Thai B2B provider marketplace. Map their request (which may be Thai or English) to ONE service from the catalog and extract any extra keyword.

Rules:
- "service" MUST be exactly one label from the allowed enum, or "" if nothing reasonably fits.
- "keyword" = extra specifics beyond the service (industry, client type, technology, use-case), translated to ENGLISH for matching English portfolio text. Empty if none.
- Example: "อยากได้คนออกแบบโลโก้ให้ร้านกาแฟ" -> service "Logo Design", keyword "coffee shop cafe".
- Example: "need a team that built loyalty apps for retail" -> service "Mobile App Development", keyword "loyalty retail".

User request: """${query}"""`;

      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        output_config: { format: { type: 'json_schema', schema } },
        messages: [{ role: 'user', content: prompt }],
      });
      const block = msg.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
      if (block) {
        const raw = JSON.parse(block.text) as { service?: unknown; keyword?: unknown };
        const service = typeof raw.service === 'string' && SERVICE_LABELS.includes(raw.service) ? raw.service : '';
        const keyword = typeof raw.keyword === 'string' ? raw.keyword.trim() : '';
        if (service) return { service, keyword };
      }
    } catch {
      /* fall through to local matching */
    }
  }

  // Fallback: naive local match against English service labels and Thai industry names.
  const q = query.toLowerCase();
  const direct = SERVICE_LABELS.find((l) => q.includes(l.toLowerCase()) || l.toLowerCase().includes(q));
  if (direct) return { service: direct, keyword: '' };
  const ind = INDUSTRIES.find((i) => query.includes(i.th) || q.includes(i.name.toLowerCase()));
  if (ind && ind.services[0]) return { service: ind.services[0], keyword: '' };
  return { service: '', keyword: '' };
}

async function runSearch(service: string, keyword: string, lang: string) {
  const supabase = await createClient();

  const industry = INDUSTRIES.find((i) => i.services.includes(service));
  const siblings = industry ? industry.services : [service];
  const industryName = industry ? (lang === 'th' ? industry.th : industry.name) : '';

  const { data: companyData, error: cErr } = await supabase
    .from('companies')
    .select('id, name, name_th, description, description_th, province, services, verified, premium, views, logo_initial, logo_url')
    .overlaps('services', siblings);
  if (cErr) throw new Error('db');

  const all = (companyData ?? []).filter((c): c is CompanyRow => !!c.name);
  const exact = all.filter((c) => (c.services ?? []).includes(service));
  const industryFallback = exact.length === 0 && all.length > 0;
  const basePool = exact.length > 0 ? exact : all;

  if (basePool.length === 0) {
    return { service, industry: industryName, count: 0, exactCount: 0, industryFallback: false, top: [], more: [], keywordRelaxed: false };
  }

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
  type Scored = { company: CompanyRow; exactMatch: boolean; bestProject: PortfolioRow | null; score: number; hasPortfolio: boolean };

  const scored: Scored[] = basePool.map((company) => {
    const projects = (pfByCompany.get(company.id) ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const exactMatch = (company.services ?? []).includes(service);
    let score = 0;
    let bestProject: PortfolioRow | null = projects[0] ?? null;
    if (!kw) {
      score = 1;
    } else {
      const companyBlob = [company.name, company.name_th, company.description, company.description_th, ...(company.services ?? [])].filter(Boolean).join(' ').toLowerCase();
      const matching = projects.filter((p) => {
        const blob = [p.title, p.description, p.description_th, p.results, p.results_th, p.category, p.confidential ? '' : p.client].filter(Boolean).join(' ').toLowerCase();
        return blob.includes(kw);
      });
      if (matching.length > 0) { score = 2; bestProject = matching[0]; }
      else if (companyBlob.includes(kw)) { score = 1; }
      else { score = 0; }
    }
    return { company, exactMatch, bestProject, score, hasPortfolio: projects.length > 0 };
  });

  let pool = scored;
  let keywordRelaxed = false;
  if (kw) {
    const hits = scored.filter((s) => s.score > 0);
    if (hits.length > 0) pool = hits;
    else { keywordRelaxed = true; pool = scored.map((s) => ({ ...s, score: 1 })); }
  }

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
  const more = ranked.slice(3).map((s) => ({ id: s.company.id, name: localize(s.company.name, s.company.name_th) || s.company.name, verified: s.company.verified, province: s.company.province }));

  // count = providers actually matched & shown (after any keyword narrowing),
  // so the headline never says "2" when only 1 card appears.
  return { service, industry: industryName, count: ranked.length, exactCount: exact.length, industryFallback, top, more, keywordRelaxed };
}

export async function POST(request: NextRequest) {
  let query = '';
  let service = '';
  let keyword = '';
  let lang = 'en';
  try {
    const body = await request.json();
    query = typeof body.query === 'string' ? body.query.trim() : '';
    service = typeof body.service === 'string' ? body.service.trim() : '';
    keyword = typeof body.keyword === 'string' ? body.keyword.trim() : '';
    lang = body.lang === 'th' ? 'th' : 'en';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Free-text path: let Claude interpret the natural-language query first.
  let interpreted: { service: string; keyword: string } | null = null;
  if (query) {
    interpreted = await interpretQuery(query);
    service = interpreted.service;
    if (!keyword) keyword = interpreted.keyword;
    if (!service) {
      return NextResponse.json({ understood: false, interpreted, service: '', industry: '', count: 0, exactCount: 0, industryFallback: false, top: [], more: [], keywordRelaxed: false });
    }
  }

  if (!service) return NextResponse.json({ error: 'A service or query is required.' }, { status: 400 });

  try {
    const result = await runSearch(service, keyword, lang);
    return NextResponse.json({ understood: true, interpreted: interpreted ?? { service, keyword }, ...result });
  } catch {
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 502 });
  }
}
