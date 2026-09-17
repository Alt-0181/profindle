import type { SupabaseClient } from '@supabase/supabase-js';

export interface CompanyAccess {
  // The company this user manages (their own if they own one — Option A — else
  // the one they're an active collaborator on), plus what they're allowed to do.
  company: Record<string, any> | null;
  companyId: string | null;
  isOwner: boolean;
  isMember: boolean;
  canEditCompany: boolean;
  canEditPortfolio: boolean;
}

const EMPTY: CompanyAccess = {
  company: null, companyId: null, isOwner: false, isMember: false,
  canEditCompany: false, canEditPortfolio: false,
};

/**
 * Resolve the company a signed-in user manages and their permissions.
 *
 * Option A: a user who owns a company always manages their own; collaboration
 * only applies to users without their own company. Falls back to the first
 * active membership otherwise.
 */
export async function resolveCompanyAccess(
  supabase: SupabaseClient,
  userId: string | null | undefined,
  columns = '*',
): Promise<CompanyAccess> {
  if (!userId) return EMPTY;

  // 1) Owned company wins.
  const { data: owned } = await supabase
    .from('companies').select(columns).eq('user_id', userId).maybeSingle();
  if (owned) {
    return { company: owned as any, companyId: (owned as any).id, isOwner: true, isMember: false, canEditCompany: true, canEditPortfolio: true };
  }

  // 2) Active collaborator membership.
  const { data: mem } = await supabase
    .from('company_members')
    .select('company_id, can_edit_company, can_edit_portfolio')
    .eq('user_id', userId).eq('status', 'active')
    .order('accepted_at', { ascending: true })
    .limit(1).maybeSingle();
  if (!mem) return EMPTY;

  const { data: company } = await supabase
    .from('companies').select(columns).eq('id', (mem as any).company_id).maybeSingle();
  if (!company) return EMPTY;

  return {
    company: company as any,
    companyId: (company as any).id,
    isOwner: false,
    isMember: true,
    canEditCompany: !!(mem as any).can_edit_company,
    canEditPortfolio: !!(mem as any).can_edit_portfolio,
  };
}
