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
 * - Deleting an OWNER removes their whole team: every collaborator on the
 *   owner's companies has their account deleted too ("owner delete → remove
 *   all"). Deleting a collaborator on its own only removes that collaborator
 *   (they own no company, so nothing else is touched and the owner is left
 *   intact).
 * - Finally the auth user is deleted.
 *
 * `admin` must be a service-role client. Returns an Error on failure, else null.
 */
export async function deleteUserAccount(
  admin: SupabaseClient,
  userId: string,
  // Guards against cycles when cascading through collaborators. Internal.
  seen: Set<string> = new Set(),
): Promise<Error | null> {
  if (seen.has(userId)) return null;
  seen.add(userId);

  const { data: owned } = await admin
    .from('companies')
    .select('id, source')
    .eq('user_id', userId);
  const companyIds = (owned ?? []).map((c) => (c as { id: string }).id);

  // Collect this user's collaborators BEFORE their companies (and the
  // membership rows on them) are removed. If the company_members table isn't
  // present (e.g. the collaborators feature hasn't been migrated on this
  // environment yet), skip team handling entirely and behave as before.
  let collaboratorIds: string[] = [];
  let membersTableOk = false;
  if (companyIds.length) {
    const { data: members, error: memErr } = await admin
      .from('company_members')
      .select('user_id')
      .in('company_id', companyIds)
      .not('user_id', 'is', null);
    if (!memErr) {
      membersTableOk = true;
      collaboratorIds = [
        ...new Set((members ?? []).map((m) => (m as { user_id: string }).user_id).filter(Boolean)),
      ];
    }
  }

  for (const c of owned ?? []) {
    const company = c as { id: string; source?: string };
    if (company.source === 'seeded') {
      await revertCompanyToUnclaimed(admin, company.id);
    } else {
      await admin.from('portfolio_projects').delete().eq('company_id', company.id);
      await admin.from('companies').delete().eq('id', company.id);
    }
  }

  // Clear any remaining membership rows on these companies — pending invites and
  // rows on a reverted (kept) unclaimed listing don't cascade on their own.
  if (membersTableOk && companyIds.length) {
    await admin.from('company_members').delete().in('company_id', companyIds);
  }

  // Owner delete removes the team: delete each collaborator's account too, via
  // the same cleanup path (so anything they happen to own is handled safely).
  for (const cid of collaboratorIds) {
    if (cid !== userId) await deleteUserAccount(admin, cid, seen);
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  return error ? new Error(error.message) : null;
}
