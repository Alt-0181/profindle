import { createHash } from 'crypto';

// Broad bot / automation / crawler signature. Keeps automated traffic out of
// the first-party analytics so the numbers reflect real humans.
export const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|monitor|preview|python-requests|curl|wget|axios|go-http|node-fetch|okhttp|scrapy|semrush|ahrefs|mj12|dotbot|petalbot|yandex|baidu|applebot|duckduck|archive\.org|uptime|pingdom|gtmetrix|screaming/i;

export function isBotUA(ua: string | null | undefined): boolean {
  // An empty user-agent is itself a strong automation signal.
  return !ua || BOT_RE.test(ua);
}

// Salted hash of IP + UA — never the raw IP (PDPA). The SAME device+network in a
// normal window and an incognito window produces the SAME hash (same IP+UA), so
// excluding this hash also excludes your own test visits in incognito.
export function visitorHashFromHeaders(headers: Headers): string {
  const ip =
    (headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown';
  const ua = headers.get('user-agent') ?? '';
  const salt = process.env.VIEW_HASH_SALT ?? 'profindle-views';
  return createHash('sha256').update(`${salt}|${ip}|${ua}`).digest('hex').slice(0, 40);
}
