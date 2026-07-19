import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { notifyAdmin } from '@/lib/notify';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let companyName = 'Unknown';
  let companyId: string | null = null;
  const userEmail = user?.email ?? 'Unknown';

  if (user) {
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('user_id', user.id)
      .maybeSingle();
    if (company?.name) companyName = company.name;
    if (company?.id) companyId = company.id;
  }

  // Persist a claim record so the admin has a reliable queue. Only insert if
  // this user has no open (pending) claim yet — a partial unique index also
  // guards against duplicates at the DB level. Failures here (e.g. table not
  // yet created) must not block the notification, so they are swallowed.
  if (user) {
    try {
      const admin = getAdmin();
      const { data: existing } = await admin
        .from('early_bird_claims')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (!existing) {
        await admin.from('early_bird_claims').insert({
          user_id: user.id,
          company_id: companyId,
          company_name: companyName,
          user_email: userEmail,
        });
      }
    } catch {
      // ignore — the notification below is the fallback
    }
  }

  await notifyAdmin(
    `[Profindle] Early Bird Request: ${companyName}`,
    `<p><strong>${companyName}</strong> (${userEmail}) just clicked "Claim Early Bird Premium" on Profindle.</p><p><a href="https://profindle.com/en/admin">View in Admin Panel →</a></p>`,
    `⭐ Early Bird Request!\n\n${companyName} (${userEmail}) wants Premium Early Bird access.\n\nAdmin panel: https://profindle.com/en/admin`,
  );

  return NextResponse.json({ ok: true });
}
