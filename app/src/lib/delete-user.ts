import type { SupabaseClient } from '@supabase/supabase-js';
import { revertCompanyToUnclaimed } from './revert-company';

/**
 * Fully delete a user account and clean up their data — the single source of
 * truth used by both self-delete (/api/delete-account) and super-admin delete
 * (/api/admin/users), so the two never drift apart.
 *
 * - A company the user CLAIMED that was originally a seeded listing is reverted
 *   to unclaimed (kept in the directory, owner content scrubbed) rather than
 *   deleted — deleting it would silently shrink the public directory.
 * - A company the user CREATED from scratch is their own content → deleted
 *   (its portfolio + team memberships cascade).
 * - Finally the auth user is deleted.
 *
 * `admin` must be a service-role client. Returns an Error on failure, else null.
 */
export async function deleteUserAccount(
  admin: SupabaseClient,
  userId: string,
): Promise<Error | null> {
  const { data: owned } = await admin
    .from('companies')
    .select('id, source')
    .eq('user_id', userId);

  for (const c of owned ?? []) {
    const company = c as { id: string; source?: string };
    if (company.source === 'seeded') {
      await revertCompanyToUnclaimed(admin, company.id);
    } else {
      await admin.from('portfolio_projects').delete().eq('company_id', company.id);
      await admin.from('companies').delete().eq('id', company.id);
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  return error ? new Error(error.message) : null;
}
