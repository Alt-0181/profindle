import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Extract lang from `next` param for the error redirect (e.g. /en/reset-password → en)
  const lang = next.split('/').filter(Boolean)[0] ?? 'en';
  return NextResponse.redirect(`${origin}/${lang}/login?error=link_expired`);
}
