import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyLineSignature, replyMessage, makeUidReplyMessage, makeVipStatusMessage } from '@/lib/line';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Greeting sent when someone adds the Profindle LINE OA as a friend.
// The live text is editable from Super Admin → LINE Templates → Welcome Message
// (the 'welcome' row in line_message_templates). This constant is only the
// fallback used if that row is missing or empty.
const DEFAULT_WELCOME =
  'ยินดีต้อนรับสู่ Profindle! 🎉\n\n' +
  'เมื่อบัญชีของคุณเชื่อมต่อแล้ว คุณจะได้รับแจ้งเตือนที่นี่ทันที เมื่อมีลูกค้าโพสต์งานที่ตรงกับบริการของคุณ\n\n' +
  'พิมพ์ "status" เพื่อดูสถานะแพ็กเกจและรหัสผู้ใช้ (User ID) ของคุณได้ทุกเมื่อ\n\n' +
  '—\n\n' +
  'Welcome to Profindle! 🎉\n\n' +
  'Once your account is linked, you\'ll get an instant alert here whenever a client posts a request matching your services.\n\n' +
  'Type "status" anytime to see your plan and your User ID.';

async function getWelcomeText(): Promise<string> {
  try {
    const { data } = await adminClient()
      .from('line_message_templates')
      .select('content')
      .eq('id', 'welcome')
      .maybeSingle();
    const content = (data as { content?: string } | null)?.content?.trim();
    return content || DEFAULT_WELCOME;
  } catch {
    return DEFAULT_WELCOME;
  }
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
    await replyMessage(event.replyToken, [{ type: 'text', text: await getWelcomeText() }]);
    return;
  }

  if (event.type === 'unfollow') {
    // Do not clear line_user_id — provider may re-follow later and should stay connected.
    return;
  }

  if (event.type === 'message' && event.message?.type === 'text' && event.replyToken && userId) {
    const text: string = (event.message.text ?? '').trim();

    if (/^get\s*uid$/i.test(text)) {
      await replyMessage(event.replyToken, [makeUidReplyMessage(userId)]);
      return;
    }

    if (/^(status|สถานะ)$/i.test(text)) {
      // premium_until (Early Bird expiry) is the source of truth; fall back to
      // plan_expires_at. Query is resilient if premium_until isn't migrated yet.
      let { data: company, error } = await adminClient()
        .from('companies')
        .select('premium, premium_until, plan_expires_at')
        .eq('line_user_id', userId)
        .maybeSingle();
      if (error) {
        ({ data: company } = await adminClient()
          .from('companies')
          .select('premium, plan_expires_at')
          .eq('line_user_id', userId)
          .maybeSingle());
      }
      const plan = (company as any)?.premium ? 'premium' : 'free';
      const expiry = (company as any)?.premium_until ?? (company as any)?.plan_expires_at ?? null;
      // Also return the User ID here so the manual-connect flow ("send status to
      // get your User ID") keeps working now that the greeting no longer prints it.
      await replyMessage(event.replyToken, [makeVipStatusMessage(plan, expiry), makeUidReplyMessage(userId)]);
      return;
    }
  }
}
