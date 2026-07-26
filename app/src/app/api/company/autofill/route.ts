import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { SERVICES } from '@/lib/services';

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

/** Strip a fetched HTML page down to readable text for the model. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: NextRequest) {
  // Must be signed in to use autofill.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI autofill is not configured yet.' }, { status: 503 });
  }

  let url: string;
  try {
    ({ url } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'A website URL is required.' }, { status: 400 });
  }
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  const UA = 'Mozilla/5.0 (compatible; ProfindleBot/1.0; +https://profindle.com)';

  /** Fetch one page and return its raw HTML (empty string on any failure). */
  async function fetchHtml(target: string, timeoutMs: number): Promise<string> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(target, {
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': UA },
      });
      clearTimeout(timer);
      if (!res.ok) return '';
      return await res.text();
    } catch {
      return '';
    }
  }

  // Fetch the homepage first.
  const homeHtml = await fetchHtml(url, 12000);
  if (!homeHtml) {
    return NextResponse.json({ error: 'Could not load that website. Check the URL and try again.' }, { status: 422 });
  }

  // Find likely About / Contact pages — that's where province, address, founded year and team size usually live.
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
      } catch { /* ignore malformed href */ }
    }
  }
  // Prioritise contact/about, fetch at most 2 extra pages in parallel.
  const ranked = subLinks.sort((a, b) => {
    const score = (u: string) => (/contact|ติดต่อ/i.test(u) ? 0 : /about|เกี่ยวกับ/i.test(u) ? 1 : 2);
    return score(a) - score(b);
  }).slice(0, 2);
  const extraHtml = ranked.length ? await Promise.all(ranked.map((u) => fetchHtml(u, 8000))) : [];

  // Combine homepage + subpages into one text blob for the model (homepage weighted first).
  const pageText = [homeHtml, ...extraHtml]
    .filter(Boolean)
    .map((h) => htmlToText(h))
    .join('\n\n--- PAGE BREAK ---\n\n')
    .slice(0, 18000);

  if (pageText.length < 40) {
    return NextResponse.json({ error: 'That website did not return enough readable content to analyze.' }, { status: 422 });
  }

  const serviceLabels = SERVICES.map((s) => s.label);

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      nameEn: { type: 'string', description: 'Company trading/brand name in English. Empty string if unknown.' },
      nameTh: { type: 'string', description: 'Company name in Thai. Translate/transliterate from English if the site has no Thai name. Empty string if unknown.' },
      descEn: { type: 'string', description: '1-3 sentence company description in English. Empty string if unknown.' },
      descTh: { type: 'string', description: 'The same description in Thai. Empty string if unknown.' },
      services: { type: 'array', items: { type: 'string' }, description: 'Up to 8 services, chosen ONLY from the provided allowed list — exact strings.' },
      province: { type: 'string', description: 'Thai province in English, chosen ONLY from the allowed list. Empty string if unknown.' },
      address: { type: 'string', description: 'Street address / district line (excluding the province name), e.g. "128 Sukhumvit Rd, Khlong Toei". Empty string if unknown.' },
      teamSize: { type: 'string', description: 'One of the allowed team-size buckets. Empty string if unknown.' },
      foundedYear: { type: 'string', description: 'Four-digit founding year, e.g. "2018". Empty string if unknown.' },
      phone: { type: 'string', description: 'Public contact phone. Empty string if unknown.' },
      emailPublic: { type: 'string', description: 'Public contact email. Empty string if unknown.' },
    },
    required: ['nameEn', 'nameTh', 'descEn', 'descTh', 'services', 'province', 'address', 'teamSize', 'foundedYear', 'phone', 'emailPublic'],
  };

  const prompt = `You are helping a Thai B2B service provider fill in their company profile from their website.

The text may contain several pages (homepage, About, Contact) separated by "--- PAGE BREAK ---". Use all of them.

Extract the fields below from the website text. Rules:
- Only use information actually present in the text. Never invent facts. If a field is unknown, return an empty string (or [] for services).
- IGNORE website-template / demo placeholder content. Many sites are built from templates that leave dummy contact data in the page (e.g. addresses like "8901 Elgin St, Celina, Delaware", US-state addresses on a Thai company, phone numbers starting "+001", emails ending in "@my.com" / "@example.com" / "@yourdomain", "Lorem ipsum", "John Doe", "Acme"). Treat any such value as unknown and return an empty string. A real Thai provider's address should be in Thailand.
- Write descTh and nameTh in natural Thai. If the site is English-only, translate for descTh and transliterate/translate the name for nameTh.
- For "services", pick ONLY exact strings from this allowed list (up to 8, most relevant first):
${serviceLabels.join(', ')}
- For "province": infer it from any address, contact block, or "located in / office in" text, then pick ONLY from: ${PROVINCES.join(', ')}. Map Thai names (e.g. กรุงเทพ / กรุงเทพมหานคร → Bangkok, เชียงใหม่ → Chiang Mai). Empty string only if truly not stated.
- For "address": the street/building/district portion of the office address, WITHOUT the province and postal code. Look especially in the Contact page.
- For "teamSize": pick ONLY from ${TEAM_SIZES.join(', ')}. Infer from cues like "team of 20", "we are a small studio", staff/team listings.
- For "foundedYear": look for "established/founded/since/est. YYYY", a copyright range like "© 2015–2024", or company history. Return only a plausible four-digit year.

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
    if (!textBlock) return NextResponse.json({ error: 'The AI returned no usable result. Please try again.' }, { status: 502 });

    const raw = JSON.parse(textBlock.text) as Record<string, unknown>;

    // Validate/sanitise against the known option sets.
    const services = Array.isArray(raw.services)
      ? (raw.services as unknown[]).filter((s): s is string => typeof s === 'string' && serviceLabels.includes(s)).slice(0, 8)
      : [];
    const province = typeof raw.province === 'string' && PROVINCES.includes(raw.province) ? raw.province : '';
    const teamSize = typeof raw.teamSize === 'string' && TEAM_SIZES.includes(raw.teamSize) ? raw.teamSize : '';
    const yearStr = typeof raw.foundedYear === 'string' ? raw.foundedYear.trim() : '';
    const yearNum = Number(yearStr);
    const foundedYear = /^\d{4}$/.test(yearStr) && yearNum >= 1900 && yearNum <= 2026 ? yearStr : '';
    const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

    // ── Drop obvious website-template / demo placeholder values ──────────────
    // Site builders ship dummy contact blocks (e.g. "Saalyn" agency template:
    // 8901 Elgin St, Celina Delaware; +001 …; name@my.com) that owners forget to
    // remove. They live in the page source, so the model extracts them faithfully.
    // These deterministic filters strip the common ones before they reach the form.
    const PLACEHOLDER_EMAIL_DOMAINS = /@(my\.com|example\.(com|org|net)|domain\.com|yourdomain\.\w+|test\.com|sample\.com|email\.com|company\.com|acme\.\w+|placeholder\.\w+)$/i;
    const PLACEHOLDER_TEXT = /(lorem ipsum|celina|delaware|elgin st|8901 elgin|123 main|main street\b|street name|your (street|address|company)|anytown|123 street|example\.com|@my\.com|jane doe|john doe|acme|placeholder|dummy)/i;

    const cleanEmail = (() => {
      const e = str(raw.emailPublic);
      if (!e) return '';
      if (PLACEHOLDER_EMAIL_DOMAINS.test(e) || PLACEHOLDER_TEXT.test(e)) return '';
      return e;
    })();
    const cleanPhone = (() => {
      const p = str(raw.phone);
      if (!p) return '';
      // "+001" is not a real country code; template demos love it. Also strip obvious dummies.
      if (/^\+?0*01[\s-]/.test(p) || /(123[\s-]?456|555[\s-]?5555|000[\s-]?000|1234567890)/.test(p)) return '';
      return p;
    })();
    const cleanAddress = (() => {
      const a = str(raw.address);
      if (!a) return '';
      if (PLACEHOLDER_TEXT.test(a)) return '';
      // A US state name on a Thai provider's address is almost always template junk.
      if (/\b(delaware|celina|texas|california|new york|florida|ohio|nevada|arizona)\b/i.test(a)) return '';
      return a;
    })();

    return NextResponse.json({
      data: {
        nameEn: str(raw.nameEn),
        nameTh: str(raw.nameTh),
        descEn: str(raw.descEn),
        descTh: str(raw.descTh),
        services,
        province,
        address: cleanAddress,
        teamSize,
        foundedYear,
        phone: cleanPhone,
        emailPublic: cleanEmail,
      },
    });
  } catch (err) {
    console.error('Autofill failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'AI autofill failed. Please try again in a moment.' }, { status: 502 });
  }
}
