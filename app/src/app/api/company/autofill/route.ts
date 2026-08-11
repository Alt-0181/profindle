import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enrichCompanyFromUrl } from '@/lib/enrich-company';

export async function POST(request: NextRequest) {
  // Must be signed in to use autofill.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI autofill is not configured yet.' }, { status: 503 });
  }

  let url: string;
  try {
    ({ url } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'A website URL is required.' }, { status: 400 });
  }

  const result = await enrichCompanyFromUrl(url, apiKey);
  if (!result.ok) {
    const map: Record<string, number> = { 'Could not load site': 422, 'Not enough readable content': 422 };
    return NextResponse.json({ error: 'Could not autofill from that website. Check the URL and try again.' }, { status: map[result.error] ?? 502 });
  }

  return NextResponse.json({ data: result.data });
}
