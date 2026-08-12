// Contact-data classification for SEEDED / UNCLAIMED profiles.
//
// PDPA data-minimization rule: on an unclaimed profile we publish only
// clearly-ORGANIZATIONAL contact channels and never store personal ones. A
// provider fills in their own contact (including personal channels, if they
// wish) after they claim. Anything we can't confidently classify as
// organizational is treated as personal and dropped.
//
// This module is the single source of truth, shared by the import route and the
// one-time scrub of already-seeded rows, so both apply the exact same rule.

export type ContactClass = 'org' | 'personal' | 'unknown';

// Role-based local parts — a company inbox, not a named person.
const ROLE_EMAIL_LOCALS = new Set([
  'info', 'hello', 'contact', 'sales', 'admin', 'support', 'office', 'marketing',
  'hr', 'enquiry', 'enquiries', 'inquiry', 'inquiries', 'service', 'services',
  'account', 'accounts', 'business', 'biz', 'team', 'mail', 'general', 'cs', 'care',
]);

// Free consumer mail providers — treated as personal even with a role-ish local
// part, because they aren't a company-controlled domain.
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.co.th', 'outlook.com',
  'outlook.co.th', 'yahoo.com', 'yahoo.co.th', 'live.com', 'icloud.com', 'me.com',
  'msn.com', 'ymail.com', 'protonmail.com', 'proton.me', 'aol.com',
]);

// Normalize a Thai phone to bare digits, converting +66 / 66 prefixes to 0.
function normalizeThaiPhone(raw: string): string {
  let d = (raw ?? '').replace(/\D/g, '');
  if (d.startsWith('66')) d = '0' + d.slice(2);
  return d;
}

// Thai numbers: mobiles are 10 digits starting 06/08/09 (personal); landlines
// are 9 digits starting 02–07 (organizational); 1xxx short codes are hotlines.
export function classifyPhone(raw: string | null | undefined): ContactClass {
  const d = normalizeThaiPhone(raw ?? '');
  if (!d) return 'unknown';
  if (/^1\d{3}$/.test(d)) return 'org';        // e.g. 1112 hotline
  if (/^0[689]\d{8}$/.test(d)) return 'personal'; // mobile
  if (/^0[2-7]\d{7}$/.test(d)) return 'org';      // landline
  return 'unknown';
}

export function classifyEmail(raw: string | null | undefined): ContactClass {
  const e = (raw ?? '').trim().toLowerCase();
  if (!e || !e.includes('@')) return 'unknown';
  const [local, domain] = e.split('@');
  if (!local || !domain) return 'unknown';
  if (FREE_EMAIL_DOMAINS.has(domain)) return 'personal';
  if (ROLE_EMAIL_LOCALS.has(local)) return 'org';
  return 'personal'; // named person on a company domain
}

// Stored LINE format is prefixed: 'oa:' (Official Account) / 'id:' (personal) /
// 'phone:' (phone-based). A bare '@handle' is also an OA.
export function classifyLine(raw: string | null | undefined): ContactClass {
  const s = (raw ?? '').trim();
  if (!s) return 'unknown';
  if (s.startsWith('oa:') || s.startsWith('@')) return 'org';
  return 'personal'; // id:, phone:, or a bare personal id
}

// Given a company's raw contact fields, return only the channels safe to store
// on an unclaimed profile (organizational). Personal/unknown → null (dropped).
export function sanitizeSeededContact(input: {
  phone?: string | null;
  email?: string | null;
  line_id?: string | null;
}): { phone: string | null; email: string | null; line_id: string | null } {
  return {
    phone: classifyPhone(input.phone) === 'org' ? (input.phone ?? null) : null,
    email: classifyEmail(input.email) === 'org' ? (input.email ?? null) : null,
    line_id: classifyLine(input.line_id) === 'org' ? (input.line_id ?? null) : null,
  };
}
