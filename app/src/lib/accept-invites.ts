import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Activate every pending collaborator invite addressed to this user's email —
 * the single place invite acceptance happens, used by both the dashboard layout
 * (auto-accept on login) and the accept-invite page.
 *
 * Matching is by email: when someone signs in (or signs up) with the address an
 * owner invited, their pending membership flips to active and is linked to their
 * user id. `admin` must be a service-role client (a collaborator can't update
 * their own membership under RLS). Degrades to a no-op if the company_members
 * table isn't present on this environment. Returns how many were activated.
 */
export async function acceptPendingInvites(
  admin: SupabaseClient,
  userId: string,
  email: string | null | undefined,
): Promise<number> {
  const e = (email ?? '').trim().toLowerCase();
  if (!userId || !e) return 0;

  const { data: pending, error } = await admin
    .from('company_members')
    .select('id')
    .eq('invited_email', e)
    .eq('status', 'pending');
  if (error || !pending || pending.length === 0) return 0;

  const { error: upErr } = await admin
    .from('company_members')
    .update({ user_id: userId, status: 'active', accepted_at: new Date().toISOString() })
    .eq('invited_email', e)
    .eq('status', 'pending');
  return upErr ? 0 : pending.length;
}
