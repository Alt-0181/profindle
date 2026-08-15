import { SERVICES } from './services';

// Thai provinces (English names) — shared list for the SEO directory + filters.
export const PROVINCES = [
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

// URL-safe slug. Services/provinces are English, so ASCII slugs are stable and
// SEO-friendly: "SEO / SEM" -> "seo-sem", "Chiang Mai" -> "chiang-mai".
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[/|]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const serviceLabels = SERVICES.map((s) => s.label);
const serviceBySlug = new Map(serviceLabels.map((l) => [slugify(l), l]));
const provinceBySlug = new Map(PROVINCES.map((p) => [slugify(p), p]));

export function serviceFromSlug(slug: string): string | null {
  return serviceBySlug.get(slug) ?? null;
}
export function provinceFromSlug(slug: string): string | null {
  return provinceBySlug.get(slug) ?? null;
}
export const serviceSlug = slugify;
export const provinceSlug = slugify;

// A page needs at least this many providers to be worth indexing (avoids thin
// pages / Google's "scaled content" penalties). Fewer than this → noindex.
export const MIN_INDEXABLE = 3;
