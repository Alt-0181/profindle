import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { pushMessage, makeConnectedMessage } from '@/lib/line';
import { notifyAdmin } from '@/lib/notify';

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('line_oauth_state')?.value;

  if (!code || !state || state !== storedState) {
    const res = NextResponse.redirect(`${appUrl}/th/settings?line=error`);
    res.cookies.delete('line_oauth_state');
    return res;
  }

  const channelId = process.env.LINE_LOGIN_CHANNEL_ID!;
  const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET!;

  // Exchange code for tokens
  const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${appUrl}/api/line/callback`,
      client_id: channelId,
      client_secret: channelSecret,
    }),
  });

  if (!tokenRes.ok) {
    const res = NextResponse.redirect(`${appUrl}/th/settings?line=error`);
    res.cookies.delete('line_oauth_state');
    return res;
  }

  const { id_token } = await tokenRes.json();

  // Verify ID token with LINE and get userId
  const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id_token, client_id: channelId }),
  });

  if (!verifyRes.ok) {
    const res = NextResponse.redirect(`${appUrl}/th/settings?line=error`);
    res.cookies.delete('line_oauth_state');
    return res;
  }

  const verifyData = await verifyRes.json();
  const lineUserId: string = verifyData.sub;
  const lineDisplayName: string | null = verifyData.name ?? null;

  // Save to the authenticated user's company
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const res = NextResponse.redirect(`${appUrl}/th/login`);
    res.cookies.delete('line_oauth_state');
    return res;
  }

  const { data: company } = await supabase.from('companies').select('name').eq('user_id', user.id).maybeSingle();
  await supabase.from('companies').update({ line_user_id: lineUserId, line_display_name: lineDisplayName }).eq('user_id', user.id);

  const companyName = company?.name ?? user.email ?? 'Unknown';

  // Confirm the connection to the provider (best-effort)
  try { await pushMessage(lineUserId, [makeConnectedMessage()]); } catch {}

  // Notify admin
  await notifyAdmin(
    `[Profindle] New LINE Connection: ${companyName}`,
    `<p><strong>${companyName}</strong> just connected their LINE account on Profindle.</p><p>LINE UID: <code>${lineUserId}</code></p><p><a href="https://profindle.com/en/admin">View in Admin Panel →</a></p>`,
    `🔗 New LINE Connection!\n\n${companyName} just connected their LINE account.\n\nAdmin panel: https://profindle.com/en/admin`,
  );

  const res = NextResponse.redirect(`${appUrl}/th/settings?line=connected&section=line`);
  res.cookies.delete('line_oauth_state');
  return res;
}
