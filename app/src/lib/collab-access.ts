import { createClient as adminClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export function getAdmin(): SupabaseClient {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export interface CollabRole {
  isOwner: boolean;
  isMember: boolean;
  canEditCompany: boolean;
  canEditPortfolio: boolean;
  requireApproval: boolean;
}

/**
 * Resolve a user's authority over a specific company, server-side, using a
 * service-role client. Returns null when they have no access at all. Owners get
 * full rights; active collaborators get exactly the permissions granted on their
 * membership. `requireApproval` is the company's setting — the caller decides
 * whether to apply a change live or queue it based on isOwner + requireApproval.
 */
export async function resolveCollabRole(
  admin: SupabaseClient,
  userId: string,
  companyId: string,
): Promise<CollabRole | null> {
  if (!userId || !companyId) return null;

  const { data: company } = await admin
    .from('companies')
    .select('id, user_id, require_approval')
    .eq('id', companyId)
    .maybeSingle();
  if (!company) return null;

  const requireApproval = !!(company as any).require_approval;

  if ((company as any).user_id === userId) {
    return { isOwner: true, isMember: false, canEditCompany: true, canEditPortfolio: true, requireApproval };
  }

  const { data: mem } = await admin
    .from('company_members')
    .select('can_edit_company, can_edit_portfolio, status')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  if (!mem) return null;

  return {
    isOwner: false,
    isMember: true,
    canEditCompany: !!(mem as any).can_edit_company,
    canEditPortfolio: !!(mem as any).can_edit_portfolio,
    requireApproval,
  };
}
