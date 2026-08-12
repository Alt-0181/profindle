import Anthropic from '@anthropic-ai/sdk';
import { SERVICES } from '@/lib/services';

// Shared "read a website → structured company profile" logic used by both the
// per-company autofill (/api/company/autofill) and the admin batch importer
// (/api/admin/enrich-urls). Runs server-side, so it needs real internet egress.

const PROVINCES = [
  'Bangkok', 'Amnat Charoen', 'Ang Thong', 'Bueng Kan', 'Buri Ram',
  'Chachoengsao', 'Chai Nat', 'Chaiyaphum', 'Chanthaburi', 'Chiang Mai',
  'Chiang Rai', 'Chon Buri', 'Chumphon', 'Kalasin', 'Kamphaeng Phet',
  'Kanchanaburi', 'Khon Kaen', 'Krabi', 'Lampang', 'Lamphun',
  'Loei', 'Lop Buri', 'Mae Hong Son', 'Maha Sarakham', 'Mukdahan',
  'Nakhon Nayok', 'Nakhon Pathom', 'Nakhon Phanom', 'Nakhon Ratchasima', 'Nakhon Sawan',
  'Nakhon Si Thammarat', 'Nan', 'Narathiwat', 'Nong Bua Lam Phu', 'Nong Khai',
  'Nonthaburi', 'Pathum Thani', 'Pattani', 'Phang Nga', 'Phatthalung',
  'Phayao', 'Phetchabun', 'Phetchaburi', 'Phichit', 'Phitsanulok',
  'Phra Nakhon Si Ayutthaya', 'Phrae', 'Phuket', 'Prachin Buri', 'Prachuap Khiri Khan',
  'Ranong', 'Ratchaburi', 'Rayong', 'Roi Et', 'Sa Kaeo',
  'Sakon Nakhon', 'Samut Prakan', 'Samut Sakhon', 'Samut Songkhram', 'Sara Buri',
  'Satun', 'Sing Buri', 'Si Sa Ket', 'Songkhla', 'Sukhothai',
  'Suphan Buri', 'Surat Thani', 'Surin', 'Tak', 'Trang',
  'Trat', 'Ubon Ratchathani', 'Udon Thani', 'Uthai Thani', 'Uttaradit',
  'Yala', 'Yasothon',
];
const TEAM_SIZES = ['1-5', '6-15', '16-50', '51-200', '200+'];

export type EnrichedCompany = {
  nameEn: string; nameTh: string; descEn: string; descTh: string;
  services: string[]; province: string; address: string;
  teamSize: string; foundedYear: string; phone: string; emailPublic: string;
};

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ').trim();
}

const UA = 'Mozilla/5.0 (compatible; ProfindleBot/1.0; +https://profindle.com)';

async function fetchHtml(target: string, timeoutMs: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': UA } });
    clearTimeout(timer);
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  }
}

/** Fetch a website (homepage + likely About/Contact) and extract a structured
 *  company profile with Claude Haiku. Returns null-ish error string on failure. */
export async function enrichCompanyFromUrl(
  rawUrl: string,
  apiKey: string,
): Promise<{ ok: true; data: EnrichedCompany } | { ok: false; error: string }> {
  let url = (rawUrl ?? '').trim();
  if (!url) return { ok: false, error: 'Empty URL' };
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  const homeHtml = await fetchHtml(url, 12000);
  if (!homeHtml) return { ok: false, error: 'Could not load site' };

  const origin = (() => { try { return new URL(url).origin; } catch { return url.replace(/\/+$/, ''); } })();
  const subLinks: string[] = [];
  const linkRe = /href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(homeHtml)) !== null && subLinks.length < 12) {
    const href = m[1];
    if (/(about|contact|company|team|เกี่ยวกับ|ติดต่อ|บริษัท)/i.test(href) && !/^(mailto:|tel:|javascript:|#)/i.test(href)) {
      try {
        const abs = new URL(href, url).href;
        if (abs.startsWith(origin) && !subLinks.includes(abs) && abs !== url) subLinks.push(abs);
      } catch { /* ignore */ }
    }
  }
  const ranked = subLinks.sort((a, b) => {
    const score = (u: string) => (/contact|ติดต่อ/i.test(u) ? 0 : /about|เกี่ยวกับ/i.test(u) ? 1 : 2);
    return score(a) - score(b);
  }).slice(0, 2);
  const extraHtml = ranked.length ? await Promise.all(ranked.map((u) => fetchHtml(u, 8000))) : [];

  const pageText = [homeHtml, ...extraHtml].filter(Boolean).map(htmlToText).join('\n\n--- PAGE BREAK ---\n\n').slice(0, 18000);
  if (pageText.length < 40) return { ok: false, error: 'Not enough readable content' };

  const serviceLabels = SERVICES.map((s) => s.label);
  const schema = {
    type: 'object', additionalProperties: false,
    properties: {
      nameEn: { type: 'string' }, nameTh: { type: 'string' },
      descEn: { type: 'string' }, descTh: { type: 'string' },
      services: { type: 'array', items: { type: 'string' } },
      province: { type: 'string' }, address: { type: 'string' },
      teamSize: { type: 'string' }, foundedYear: { type: 'string' },
      phone: { type: 'string' }, emailPublic: { type: 'string' },
    },
    required: ['nameEn', 'nameTh', 'descEn', 'descTh', 'services', 'province', 'address', 'teamSize', 'foundedYear', 'phone', 'emailPublic'],
  };

  const prompt = `You are helping catalog a Thai B2B service provider from their website.

The text may contain several pages (homepage, About, Contact) separated by "--- PAGE BREAK ---". Use all of them.

Extract the fields below. Rules:
- Only use information actually present. Never invent facts. Unknown field → empty string (or [] for services).
- IGNORE website-template / demo placeholder content (e.g. "8901 Elgin St, Celina, Delaware", US-state addresses on a Thai company, "+001" phones, emails ending "@my.com"/"@example.com", "Lorem ipsum", "John Doe", "Acme"). Treat such values as unknown.
- Write descTh and nameTh in natural Thai (translate/transliterate if the site is English-only).
- "services": ONLY exact strings from this list (up to 8, most relevant first): ${serviceLabels.join(', ')}
- "province": ONLY from: ${PROVINCES.join(', ')}. Map Thai names (กรุงเทพ → Bangkok, เชียงใหม่ → Chiang Mai). Empty if not stated.
- "address": street/building/district portion WITHOUT province/postal code.
- "teamSize": ONLY from ${TEAM_SIZES.join(', ')}.
- "foundedYear": a plausible four-digit year, else empty.

WEBSITE TEXT:
"""
${pageText}
"""`;

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      output_config: { format: { type: 'json_schema', schema } },
      messages: [{ role: 'user', content: prompt }],
    });
    const textBlock = message.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    if (!textBlock) return { ok: false, error: 'No AI result' };
    const raw = JSON.parse(textBlock.text) as Record<string, unknown>;

    const services = Array.isArray(raw.services)
      ? (raw.services as unknown[]).filter((s): s is string => typeof s === 'string' && serviceLabels.includes(s)).slice(0, 8)
      : [];
    const province = typeof raw.province === 'string' && PROVINCES.includes(raw.province) ? raw.province : '';
    const teamSize = typeof raw.teamSize === 'string' && TEAM_SIZES.includes(raw.teamSize) ? raw.teamSize : '';
    const yearStr = typeof raw.foundedYear === 'string' ? raw.foundedYear.trim() : '';
    const yearNum = Number(yearStr);
    const foundedYear = /^\d{4}$/.test(yearStr) && yearNum >= 1900 && yearNum <= 2026 ? yearStr : '';
    const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

    const PLACEHOLDER_EMAIL_DOMAINS = /@(my\.com|example\.(com|org|net)|domain\.com|yourdomain\.\w+|test\.com|sample\.com|email\.com|company\.com|acme\.\w+|placeholder\.\w+)$/i;
    const PLACEHOLDER_TEXT = /(lorem ipsum|celina|delaware|elgin st|8901 elgin|123 main|main street\b|street name|your (street|address|company)|anytown|123 street|example\.com|@my\.com|jane doe|john doe|acme|placeholder|dummy)/i;
    const cleanEmail = (() => { const e = str(raw.emailPublic); if (!e) return ''; return (PLACEHOLDER_EMAIL_DOMAINS.test(e) || PLACEHOLDER_TEXT.test(e)) ? '' : e; })();
    const cleanPhone = (() => { const p = str(raw.phone); if (!p) return ''; return (/^\+?0*01[\s-]/.test(p) || /(123[\s-]?456|555[\s-]?5555|000[\s-]?000|1234567890)/.test(p)) ? '' : p; })();
    const cleanAddress = (() => { const a = str(raw.address); if (!a) return ''; if (PLACEHOLDER_TEXT.test(a)) return ''; if (/\b(delaware|celina|texas|california|new york|florida|ohio|nevada|arizona)\b/i.test(a)) return ''; return a; })();

    return {
      ok: true,
      data: {
        nameEn: str(raw.nameEn), nameTh: str(raw.nameTh),
        descEn: str(raw.descEn), descTh: str(raw.descTh),
        services, province, address: cleanAddress, teamSize, foundedYear,
        phone: cleanPhone, emailPublic: cleanEmail,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'AI failed' };
  }
}
