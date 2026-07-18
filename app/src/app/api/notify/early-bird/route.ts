import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { notifyAdmin } from '@/lib/notify';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let companyName = 'Unknown';
  let userEmail = user?.email ?? 'Unknown';

  if (user) {
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('user_id', user.id)
      .maybeSingle();
    if (company?.name) companyName = company.name;
  }

  await notifyAdmin(
    `[Profindle] Early Bird Request: ${companyName}`,
    `<p><strong>${companyName}</strong> (${userEmail}) just clicked "Claim Early Bird Premium" on Profindle.</p><p><a href="https://profindle.com/en/admin">View in Admin Panel →</a></p>`,
    `⭐ Early Bird Request!\n\n${companyName} (${userEmail}) wants Premium Early Bird access.\n\nAdmin panel: https://profindle.com/en/admin`,
  );

  return NextResponse.json({ ok: true });
}
