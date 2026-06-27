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

  // Fetch all companies with their owner's email via auth.users join
  const { data: companies } = await admin
    .from('companies')
    .select('id, name, name_th, industry, verified, premium, created_at, dbd_certificate_url, services, email, user_id')
    .order('created_at', { ascending: false });

  // Fetch emails for each user_id
  const userIds = (companies ?? []).map(c => c.user_id).filter(Boolean);
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = Object.fromEntries((users ?? []).map(u => [u.id, u.email]));

  const enriched = (companies ?? []).map(c => ({
    ...c,
    services: c.services ?? [],
    user_email: emailMap[c.user_id] ?? null,
  }));

  return <AdminClient companies={enriched} lang={lang} />;
}
