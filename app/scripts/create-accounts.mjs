/**
 * One-time setup script — creates super admin + provider accounts in Supabase Auth.
 *
 * Usage:
 *   1. Copy your real Service Role key from:
 *      Supabase Dashboard → Project Settings → API → service_role (secret)
 *   2. Run:
 *      SUPABASE_SERVICE_ROLE_KEY=your_real_key node scripts/create-accounts.mjs
 */

const SUPABASE_URL = 'https://evgxvqfkhqgyaftggoec.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY === 'placeholder-service-role-key') {
  console.error('❌  Set SUPABASE_SERVICE_ROLE_KEY env var to your real service role key first.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
};

async function createUser(email, password, meta = {}) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,   // skip email verification for admin-created accounts
      user_metadata: meta,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    // If user already exists, just report it
    if (data.msg?.includes('already been registered') || data.code === 'email_exists') {
      console.log(`⚠️   ${email} already exists — skipping`);
      return null;
    }
    throw new Error(`Failed to create ${email}: ${JSON.stringify(data)}`);
  }
  console.log(`✅  Created: ${email}`);
  return data;
}

// ── Accounts to create ────────────────────────────────────────────────────────

const accounts = [
  // Super admin
  { email: 'support@profindle.com', password: '1manarmy!', meta: { full_name: 'Profindle Support', role: 'super_admin' } },

  // Service providers — email from companies table, default password shown below
  // Each provider can change their password after first login via "Forgot password"
  { email: 'hello@jaidee.co.th',           password: 'Profindle2025!', meta: { full_name: 'Jaidee Solutions' } },
  { email: 'hello@pixelforgestudio.com',    password: 'Profindle2025!', meta: { full_name: 'Pixel Forge Studio' } },
  { email: 'contact@legalnexus.co.th',      password: 'Profindle2025!', meta: { full_name: 'Legal Nexus Thailand' } },
  { email: 'hello@digitalbridge.co.th',     password: 'Profindle2025!', meta: { full_name: 'Digital Bridge Agency' } },
  { email: 'hello@sanookevent.com',         password: 'Profindle2025!', meta: { full_name: 'Sanook Events' } },
  { email: 'contact@northstarlogistics.th', password: 'Profindle2025!', meta: { full_name: 'North Star Logistics' } },
  { email: 'hello@cleanpro.co.th',         password: 'Profindle2025!', meta: { full_name: 'CleanPro Services' } },
  { email: 'info@thaiwebmaster.co.th',      password: 'Profindle2025!', meta: { full_name: 'Thai Webmaster' } },
];

console.log(`\n🚀  Creating ${accounts.length} accounts...\n`);
for (const acc of accounts) {
  await createUser(acc.email, acc.password, acc.meta);
}

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Default provider password: Profindle2025!
  Providers should change it after first login.

  Super admin:
    Email    : support@profindle.com
    Password : 1manarmy!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
