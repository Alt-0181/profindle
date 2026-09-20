import { notFound } from 'next/navigation';
import { hasLocale } from '@/dictionaries';
import { createClient as adminClient } from '@supabase/supabase-js';
import { JoinClient } from './join-client';

// Collaborator invite landing. The invite email links here with ?token=<id>
// (the pending membership row id). We resolve the locked email + company name
// server-side, then the client collects a password and finishes the account.
export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ token?: string; decline?: string }>;
}) {
  const { lang } = await params;
  const { token, decline } = await searchParams;
  if (!hasLocale(lang)) notFound();

  let email = '';
  let companyName = '';
  let state: 'valid' | 'accepted' | 'invalid' = 'invalid';

  if (token) {
    const admin = adminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );
    const { data: member } = await admin
      .from('company_members')
      .select('invited_email, status, company_id')
      .eq('id', token)
      .maybeSingle();
    if (member) {
      email = (member as any).invited_email ?? '';
      state = (member as any).status === 'pending' ? 'valid' : (member as any).status === 'active' ? 'accepted' : 'invalid';
      const { data: company } = await admin
        .from('companies')
        .select('name, name_th')
        .eq('id', (member as any).company_id)
        .maybeSingle();
      companyName = ((company as any)?.name_th || (company as any)?.name) ?? '';
    }
  }

  return <JoinClient lang={lang} token={token ?? ''} email={email} companyName={companyName} state={state} declineIntent={decline === '1'} />;
}
