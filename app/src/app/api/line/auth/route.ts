import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  if (!channelId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/th/settings?line=unavailable`);
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: channelId,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/line/callback`,
    state,
    scope: 'profile openid',
  });

  const response = NextResponse.redirect(
    `https://access.line.me/oauth2/v2.1/authorize?${params}`
  );
  response.cookies.set('line_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
