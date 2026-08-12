import { createClient } from '@/lib/supabase/server';

// Emails whose activity must never count toward analytics (testing accounts).
const EXCLUDED_EMAILS = new Set(['support@profindle.com']);

/**
 * True when the current visitor's activity should NOT be recorded as analytics
 * (a profile view / contact click), so real numbers aren't contaminated by:
 *  - the support/testing account (support@profindle.com),
 *  - any super_admin,
 *  - a provider viewing their OWN company profile.
 *
 * Anonymous visitors (no session) always count — the common buyer case — and the
 * extra ownership query only runs when someone is actually logged in.
 */
export async function isExcludedViewer(companyId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false; // anonymous buyer → count it

    if (user.email && EXCLUDED_EMAILS.has(user.email.toLowerCase())) return true;
    if (user.user_metadata?.role === 'super_admin') return true;

    // Self-view: the logged-in user owns the company being viewed.
    if (companyId) {
      const { data: own } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .eq('id', companyId)
        .maybeSingle();
      if (own) return true;
    }
    return false;
  } catch {
    return false; // on any error, don't drop the event
  }
}
