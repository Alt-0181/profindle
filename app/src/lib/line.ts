import crypto from 'crypto';

const LINE_API_BASE = 'https://api.line.me/v2/bot';

export function verifyLineSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

async function linePost(path: string, body: object): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error('LINE_CHANNEL_ACCESS_TOKEN not set');
  const res = await fetch(`${LINE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE API ${res.status}: ${text}`);
  }
}

export async function replyMessage(replyToken: string, messages: object[]): Promise<void> {
  await linePost('/message/reply', { replyToken, messages });
}

export async function pushMessage(to: string, messages: object[]): Promise<void> {
  await linePost('/message/push', { to, messages });
}

export function makeBroadcastFlexMessage(broadcast: {
  id: string;
  category: string;
  budgetBand: string;
  timeline: string;
  descriptionEn: string;
  buyerCompany: string;
}): object {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://profindle.com';
  return {
    type: 'flex',
    altText: `📢 New Request: ${broadcast.category} — ${broadcast.budgetBand}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0F6F73',
        paddingAll: '16px',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            alignItems: 'center',
            contents: [
              { type: 'text', text: '📢', size: 'xxl', flex: 0 },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'sm',
                contents: [
                  { type: 'text', text: 'New Broadcast Request', color: '#FFFFFF', weight: 'bold', size: 'md' },
                  { type: 'text', text: 'via Profindle', color: '#FFFFFFA6', size: 'xs' },
                ],
              },
            ],
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '18px',
        contents: [
          { type: 'text', text: broadcast.category, weight: 'bold', size: 'xl', wrap: true, color: '#171A21' },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'xs',
            margin: 'sm',
            contents: [
              {
                type: 'box', layout: 'horizontal',
                contents: [
                  { type: 'text', text: 'Budget', color: '#9AA0AE', size: 'sm', flex: 2 },
                  { type: 'text', text: broadcast.budgetBand || '—', weight: 'bold', size: 'sm', flex: 3, color: '#171A21' },
                ],
              },
              {
                type: 'box', layout: 'horizontal',
                contents: [
                  { type: 'text', text: 'Timeline', color: '#9AA0AE', size: 'sm', flex: 2 },
                  { type: 'text', text: broadcast.timeline || '—', weight: 'bold', size: 'sm', flex: 3, color: '#171A21' },
                ],
              },
              {
                type: 'box', layout: 'horizontal',
                contents: [
                  { type: 'text', text: 'From', color: '#9AA0AE', size: 'sm', flex: 2 },
                  { type: 'text', text: broadcast.buyerCompany, weight: 'bold', size: 'sm', flex: 3, color: '#171A21', wrap: true },
                ],
              },
            ],
          },
          { type: 'separator', margin: 'md' },
          { type: 'text', text: broadcast.descriptionEn, wrap: true, color: '#444B5A', size: 'sm', maxLines: 5, margin: 'md' },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#0F6F73',
            action: {
              type: 'uri',
              label: 'View & Respond →',
              uri: `${baseUrl}/th/broadcasts/${broadcast.id}`,
            },
          },
        ],
      },
    },
  };
}

// Pushed right after a provider successfully connects their LINE account
// (OAuth or manual). They are already linked, so this is a confirmation — not
// linking instructions.
export function makeConnectedMessage(): object {
  return {
    type: 'text',
    text: `✅ เชื่อมต่อ LINE กับ Profindle สำเร็จแล้ว!\n\nจากนี้คุณจะได้รับแจ้งเตือนที่นี่ทันที เมื่อมีลูกค้าโพสต์งานที่ตรงกับบริการของคุณ\n\nพิมพ์ "status" เพื่อดูสถานะแพ็กเกจของคุณได้ทุกเมื่อ\n\n—\n\n✅ Your LINE is now connected to Profindle!\n\nYou'll get an instant alert here whenever a client posts a request matching your services.\n\nType "status" anytime to check your plan.`,
  };
}

export function makeUidReplyMessage(lineUserId: string): object {
  return {
    type: 'text',
    text: `🔑 LINE User ID ของคุณ / Your LINE User ID\n\n${lineUserId}\n\nคัดลอกรหัสนี้ไปวางใน Profindle → ตั้งค่า → เชื่อมต่อ LINE เพื่อเริ่มรับแจ้งเตือนงานใหม่ที่นี่\n\nCopy this ID into Profindle → Settings → LINE Connect to start receiving job alerts right here.`,
  };
}

export function makeVipStatusMessage(plan: string | null, planExpiresAt: string | null): object {
  if (plan === 'premium') {
    const expiry = planExpiresAt
      ? new Date(planExpiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : null;
    const expiryLine = expiry ? `ใช้งานได้ถึง ${expiry} / Active until ${expiry}\n` : '';
    return {
      type: 'text',
      text: `✨ สมาชิก Premium / Premium Member\n${expiryLine}\nคุณได้รับสิทธิ์แจ้งเตือนงานก่อนใคร เมื่อมีผู้ซื้อโพสต์ประกาศที่ตรงกับบริการของคุณ\nYou get priority job alerts the moment a buyer posts a matching request.`,
    };
  }
  return {
    type: 'text',
    text: `📋 แพ็กเกจฟรี / Free Plan\n\nอัปเกรดเป็น Premium เพื่อ:\n• แสดงก่อนใครในผลการค้นหา (Priority)\n• เพิ่มจำนวนผลงาน\n• ได้รับการแจ้งเตือน Real Time ผ่าน Line\n\n🎁 Early Bird: ใช้ Premium ฟรีถึง 31 มี.ค. 2570\nอัปเกรดที่ Profindle → แพ็กเกจ\n\nUpgrade to Premium for:\n• Priority placement\n• Unlimited portfolio showcases\n• Real-time notification via Line\n\n🎁 Early Bird: Premium free until 31 Mar 2027.\nUpgrade at Profindle → Package.`,
  };
}
