import { notFound, redirect } from 'next/navigation';
import { hasLocale } from '@/dictionaries';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { AdminClient } from './admin-client';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'super_admin') redirect(`/${lang}/home`);

  const admin = getAdmin();

  // Fetch all companies with full details
  const { data: companies } = await admin
    .from('companies')
    .select('id, name, name_th, industry, verified, premium, created_at, dbd_certificate_url, services, email, user_id, line_user_id, phone, website, address, province, team_size, founded_year, description')
    .order('created_at', { ascending: false });

  // Fetch auth users
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = Object.fromEntries((users ?? []).map(u => [u.id, u.email]));
  const userMetaMap = Object.fromEntries((users ?? []).map(u => [u.id, { role: u.user_metadata?.role, display_name: u.user_metadata?.display_name, full_name: u.user_metadata?.full_name, created_at: u.created_at }]));

  const enriched = (companies ?? []).map(c => ({
    ...c,
    services: c.services ?? [],
    user_email: emailMap[c.user_id] ?? null,
    user_meta: userMetaMap[c.user_id] ?? null,
  }));

  // Fetch broadcasts with buyer company name and match count
  const { data: broadcasts } = await admin
    .from('broadcasts')
    .select(`
      id,
      created_at,
      status,
      category,
      budget_band,
      timeline,
      companies:buyer_company_id ( name ),
      broadcast_matches ( id )
    `)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrichedBroadcasts = (broadcasts ?? []).map((b: any) => ({
    id: b.id,
    created_at: b.created_at,
    status: b.status,
    category: b.category,
    budget_band: b.budget_band,
    timeline: b.timeline,
    buyer_company_name: (Array.isArray(b.companies) ? b.companies[0]?.name : b.companies?.name) ?? null,
    match_count: Array.isArray(b.broadcast_matches) ? b.broadcast_matches.length : 0,
  }));

  // Sanitise auth users for client (only pass needed fields)
  const clientUsers = (users ?? []).map(u => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    user_metadata: {
      role: u.user_metadata?.role,
      display_name: u.user_metadata?.display_name,
      full_name: u.user_metadata?.full_name,
    },
  }));

  return (
    <AdminClient
      companies={enriched}
      users={clientUsers}
      broadcasts={enrichedBroadcasts}
      lang={lang}
    />
  );
}
