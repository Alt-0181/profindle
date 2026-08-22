import type { SupabaseClient } from '@supabase/supabase-js';

// Revert a claimed company back to an unclaimed directory listing: drop the
// ownership link and scrub owner-added personal data + uploaded content, while
// KEEPING the base business listing (name, description, services, province,
// website). Used when an owner releases a claim or deletes their account, so a
// seeded listing is never lost — it just returns to the unclaimed pool.
export async function revertCompanyToUnclaimed(admin: SupabaseClient, companyId: string) {
  // Owner-created content goes with the owner.
  await admin.from('portfolio_projects').delete().eq('company_id', companyId);

  await admin
    .from('companies')
    .update({
      user_id: null,
      claimed: false,
      verified: false,
      premium: false,
      plan: 'free',
      premium_until: null,
      // Scrub owner-supplied contact, documents, and media.
      phone: null,
      email: null,
      line_id: null,
      line_user_id: null,
      dbd_no: null,
      dbd_certificate_url: null,
      dbd_certificate_name: null,
      logo_url: null,
      banner_url: null,
      banner_url_mobile: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', companyId);
}
