import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { pushMessage, makeWelcomeMessage } from '@/lib/line';

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('line_oauth_state')?.value;

  if (!code || !state || state !== storedState) {
    const res = NextResponse.redirect(`${appUrl}/en/settings?line=error`);
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
    const res = NextResponse.redirect(`${appUrl}/en/settings?line=error`);
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
    const res = NextResponse.redirect(`${appUrl}/en/settings?line=error`);
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
    const res = NextResponse.redirect(`${appUrl}/en/login`);
    res.cookies.delete('line_oauth_state');
    return res;
  }

  await supabase.from('companies').update({ line_user_id: lineUserId, line_display_name: lineDisplayName }).eq('user_id', user.id);

  // Send welcome push (best-effort)
  try {
    await pushMessage(lineUserId, [makeWelcomeMessage(lineUserId)]);
  } catch {}

  const res = NextResponse.redirect(`${appUrl}/en/settings?line=connected&section=line`);
  res.cookies.delete('line_oauth_state');
  return res;
}
