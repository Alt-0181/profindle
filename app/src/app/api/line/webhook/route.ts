import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyLineSignature, replyMessage, makeWelcomeMessage, makeUidReplyMessage, makeVipStatusMessage } from '@/lib/line';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-line-signature') ?? '';

  if (!verifyLineSignature(rawBody, signature)) {
    return new Response('Forbidden', { status: 403 });
  }

  let body: { events?: any[] };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  await Promise.allSettled((body.events ?? []).map(handleEvent));

  return new Response('OK', { status: 200 });
}

async function handleEvent(event: any) {
  const userId: string | undefined = event.source?.userId;

  if (event.type === 'follow' && event.replyToken && userId) {
    await replyMessage(event.replyToken, [makeWelcomeMessage(userId)]);
    return;
  }

  if (event.type === 'unfollow' && userId) {
    await adminClient().from('companies').update({ line_user_id: null }).eq('line_user_id', userId);
    return;
  }

  if (event.type === 'message' && event.message?.type === 'text' && event.replyToken && userId) {
    const text: string = (event.message.text ?? '').trim();

    if (/^get\s*uid$/i.test(text)) {
      await replyMessage(event.replyToken, [makeUidReplyMessage(userId)]);
      return;
    }

    if (/^(status|สถานะ)$/i.test(text)) {
      const { data: company } = await adminClient()
        .from('companies')
        .select('premium, plan_expires_at')
        .eq('line_user_id', userId)
        .maybeSingle();
      const plan = (company as any)?.premium ? 'premium' : 'free';
      const planExpiresAt = (company as any)?.plan_expires_at ?? null;
      await replyMessage(event.replyToken, [makeVipStatusMessage(plan, planExpiresAt)]);
      return;
    }
  }
}
