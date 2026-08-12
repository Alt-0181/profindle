import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'super_admin') return null;
  return user;
}

// Format a timestamp as YYYY-MM-DD (date only). Empty string for null.
function dateOnly(ts: string | null | undefined): string {
  if (!ts) return '';
  return ts.slice(0, 10);
}

// Style a header row: bold on the brand teal, white text.
function styleHeader(sheet: ExcelJS.Worksheet) {
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F6F73' } };
  header.alignment = { vertical: 'middle' };
  header.height = 20;
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

async function workbookToResponse(wb: ExcelJS.Workbook, filename: string) {
  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(buf as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

// GET /api/admin/reports?type=company | user
// Super-admin only. Returns an .xlsx download. All-time figures (no date range).
export async function GET(request: NextRequest) {
  const caller = await requireSuperAdmin();
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const type = request.nextUrl.searchParams.get('type');
  const admin = getAdmin();
  const today = new Date().toISOString().slice(0, 10);

  if (type === 'company') {
    return buildCompanyReport(admin, today);
  }
  if (type === 'user') {
    return buildUserReport(admin, today);
  }
  return NextResponse.json({ error: 'Unknown report type. Use ?type=company or ?type=user' }, { status: 400 });
}

// Report 1 · Tab A — Company Summary. One row per company with all-time
// performance: profile views, contact intent by channel, broadcast matches,
// plus status (claimed/verified/plan/industry/province) and view date range.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildCompanyReport(admin: any, today: string) {
  const [
    { data: companies },
    { data: clicks },
    { data: matches },
    { data: views },
  ] = await Promise.all([
    admin
      .from('companies')
      .select('id, name, name_th, claimed, source, verified, premium, plan, industry, province, views, created_at')
      .order('created_at', { ascending: false }),
    admin.from('contact_clicks').select('company_id, channel'),
    admin.from('broadcast_matches').select('provider_company_id'),
    admin.from('profile_views').select('company_id, created_at'),
  ]);

  // Aggregate contact clicks per company per channel.
  const clickAgg: Record<string, Record<string, number>> = {};
  for (const c of clicks ?? []) {
    if (!c.company_id) continue;
    (clickAgg[c.company_id] ??= {})[c.channel] = ((clickAgg[c.company_id] ??= {})[c.channel] ?? 0) + 1;
  }

  // Broadcast matches per provider company.
  const matchAgg: Record<string, number> = {};
  for (const m of matches ?? []) {
    if (!m.provider_company_id) continue;
    matchAgg[m.provider_company_id] = (matchAgg[m.provider_company_id] ?? 0) + 1;
  }

  // First / last profile-view date per company.
  const viewRange: Record<string, { first: string; last: string }> = {};
  for (const v of views ?? []) {
    if (!v.company_id || !v.created_at) continue;
    const r = (viewRange[v.company_id] ??= { first: v.created_at, last: v.created_at });
    if (v.created_at < r.first) r.first = v.created_at;
    if (v.created_at > r.last) r.last = v.created_at;
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Profindle';
  const sheet = wb.addWorksheet('Company Summary');
  sheet.columns = [
    { header: 'Company ID', key: 'id', width: 38 },
    { header: 'Name', key: 'name', width: 28 },
    { header: 'Name (TH)', key: 'name_th', width: 28 },
    { header: 'Claimed', key: 'claimed', width: 10 },
    { header: 'Source', key: 'source', width: 10 },
    { header: 'Verified', key: 'verified', width: 10 },
    { header: 'Premium', key: 'premium', width: 10 },
    { header: 'Plan', key: 'plan', width: 10 },
    { header: 'Industry', key: 'industry', width: 18 },
    { header: 'Province', key: 'province', width: 16 },
    { header: 'Profile Views', key: 'views', width: 13 },
    { header: 'Contact Reveals', key: 'reveal', width: 15 },
    { header: 'LINE Clicks', key: 'line', width: 12 },
    { header: 'Phone Clicks', key: 'phone', width: 12 },
    { header: 'Email Clicks', key: 'email', width: 12 },
    { header: 'Website Clicks', key: 'website', width: 14 },
    { header: 'Broadcast Matches', key: 'matches', width: 17 },
    { header: 'First View', key: 'first_view', width: 13 },
    { header: 'Last View', key: 'last_view', width: 13 },
  ];

  for (const c of companies ?? []) {
    const ch = clickAgg[c.id] ?? {};
    const range = viewRange[c.id];
    sheet.addRow({
      id: c.id,
      name: c.name ?? '',
      name_th: c.name_th ?? '',
      claimed: c.claimed ? 'Yes' : 'No',
      source: c.source ?? '',
      verified: c.verified ? 'Yes' : 'No',
      premium: c.premium ? 'Yes' : 'No',
      plan: c.plan ?? 'free',
      industry: c.industry ?? '',
      province: c.province ?? '',
      views: c.views ?? 0,
      reveal: ch.reveal ?? 0,
      line: ch.line ?? 0,
      phone: ch.phone ?? 0,
      email: ch.email ?? 0,
      website: ch.website ?? 0,
      matches: matchAgg[c.id] ?? 0,
      first_view: range ? dateOnly(range.first) : '',
      last_view: range ? dateOnly(range.last) : '',
    });
  }
  styleHeader(sheet);

  return workbookToResponse(wb, `profindle-company-performance-${today}.xlsx`);
}

// Report 2 — User & Company Master. A CRM-style export (NOT performance).
// Two tabs: Companies (master) and Users (auth accounts).
// SECURITY: never exports DBD document URLs, auth tokens, password/hash fields,
// or any other technical/security data — only CRM-relevant business fields.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildUserReport(admin: any, today: string) {
  const [{ data: companies }, { data: { users } }] = await Promise.all([
    admin
      .from('companies')
      .select('id, name, name_th, claimed, source, verified, premium, plan, plan_expires_at, industry, province, team_size, founded_year, website, phone, email, line_id, user_id, created_at')
      .order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  // Map owner user_id -> auth account (email + sign-in timestamps).
  const userMap: Record<string, { email: string; created_at: string; last_sign_in_at: string }> = {};
  for (const u of users ?? []) {
    userMap[u.id] = {
      email: u.email ?? '',
      created_at: u.created_at ?? '',
      last_sign_in_at: u.last_sign_in_at ?? '',
    };
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Profindle';

  // --- Companies tab ---
  const cSheet = wb.addWorksheet('Companies');
  cSheet.columns = [
    { header: 'Company ID', key: 'id', width: 38 },
    { header: 'Name', key: 'name', width: 28 },
    { header: 'Name (TH)', key: 'name_th', width: 28 },
    { header: 'Claimed', key: 'claimed', width: 10 },
    { header: 'Source', key: 'source', width: 10 },
    { header: 'Verified', key: 'verified', width: 10 },
    { header: 'Premium', key: 'premium', width: 10 },
    { header: 'Plan', key: 'plan', width: 10 },
    { header: 'Plan Expires', key: 'plan_expires', width: 13 },
    { header: 'Industry', key: 'industry', width: 18 },
    { header: 'Province', key: 'province', width: 16 },
    { header: 'Team Size', key: 'team_size', width: 12 },
    { header: 'Founded', key: 'founded_year', width: 10 },
    { header: 'Website', key: 'website', width: 26 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Company Email', key: 'email', width: 26 },
    { header: 'LINE ID', key: 'line_id', width: 16 },
    { header: 'Owner Email', key: 'owner_email', width: 26 },
    { header: 'Owner Signup', key: 'owner_signup', width: 13 },
    { header: 'Owner Last Login', key: 'owner_last_login', width: 15 },
    { header: 'Company Created', key: 'created', width: 13 },
  ];
  for (const c of companies ?? []) {
    const owner = c.user_id ? userMap[c.user_id] : null;
    cSheet.addRow({
      id: c.id,
      name: c.name ?? '',
      name_th: c.name_th ?? '',
      claimed: c.claimed ? 'Yes' : 'No',
      source: c.source ?? '',
      verified: c.verified ? 'Yes' : 'No',
      premium: c.premium ? 'Yes' : 'No',
      plan: c.plan ?? 'free',
      plan_expires: dateOnly(c.plan_expires_at),
      industry: c.industry ?? '',
      province: c.province ?? '',
      team_size: c.team_size ?? '',
      founded_year: c.founded_year ?? '',
      website: c.website ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      line_id: c.line_id ?? '',
      owner_email: owner?.email ?? '',
      owner_signup: owner ? dateOnly(owner.created_at) : '',
      owner_last_login: owner ? dateOnly(owner.last_sign_in_at) : '',
      created: dateOnly(c.created_at),
    });
  }
  styleHeader(cSheet);

  // --- Users tab ---
  // How many companies each user owns (a quick CRM signal).
  const ownedCount: Record<string, number> = {};
  for (const c of companies ?? []) {
    if (c.user_id) ownedCount[c.user_id] = (ownedCount[c.user_id] ?? 0) + 1;
  }

  const uSheet = wb.addWorksheet('Users');
  uSheet.columns = [
    { header: 'User ID', key: 'id', width: 38 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Display Name', key: 'display_name', width: 22 },
    { header: 'Full Name', key: 'full_name', width: 22 },
    { header: 'Role', key: 'role', width: 14 },
    { header: 'LINE Linked', key: 'line_linked', width: 12 },
    { header: 'Companies Owned', key: 'owned', width: 16 },
    { header: 'Signup Date', key: 'created', width: 13 },
    { header: 'Last Login', key: 'last_login', width: 13 },
  ];
  for (const u of users ?? []) {
    uSheet.addRow({
      id: u.id,
      email: u.email ?? '',
      display_name: u.user_metadata?.display_name ?? '',
      full_name: u.user_metadata?.full_name ?? '',
      role: u.user_metadata?.role ?? 'user',
      line_linked: u.user_metadata?.line_user_id ? 'Yes' : 'No',
      owned: ownedCount[u.id] ?? 0,
      created: dateOnly(u.created_at),
      last_login: dateOnly(u.last_sign_in_at),
    });
  }
  styleHeader(uSheet);

  return workbookToResponse(wb, `profindle-user-company-master-${today}.xlsx`);
}
