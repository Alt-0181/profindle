import { notFound } from 'next/navigation';
import { hasLocale } from '@/dictionaries';
import { AcceptInviteClient } from './accept-invite-client';

// The collaborator lands here from the invite email. The invite session comes
// from the URL hash (detected client-side), so the work happens in a client
// component: establish the session, activate the membership, and — for a fresh
// invite (?welcome=1) — let them set a password on their locked email.
export default async function AcceptInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { lang } = await params;
  const { welcome } = await searchParams;
  if (!hasLocale(lang)) notFound();
  return <AcceptInviteClient lang={lang} welcome={welcome === '1'} />;
}
