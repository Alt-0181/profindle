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
                  { type: 'text', text: 'via Profindle', color: 'rgba(255,255,255,0.65)', size: 'xs' },
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
              uri: `${baseUrl}/en/broadcasts/${broadcast.id}`,
            },
          },
        ],
      },
    },
  };
}

export function makeWelcomeMessage(lineUserId: string): object {
  return {
    type: 'text',
    text: `Welcome to Profindle! 🎉\n\nYou'll receive broadcast notifications here when clients post requests matching your services.\n\nTo link your account:\n1. Go to Profindle → Settings → LINE Connect\n2. Enter your LINE User ID below\n\nYour LINE User ID:\n${lineUserId}`,
  };
}

export function makeUidReplyMessage(lineUserId: string): object {
  return {
    type: 'text',
    text: `LINE UID:\n${lineUserId}\n\nTrigger Message: GET UID`,
  };
}

export function makeVipStatusMessage(plan: string | null, planExpiresAt: string | null): object {
  if (plan === 'premium') {
    const expiry = planExpiresAt
      ? new Date(planExpiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : null;
    const expiryLine = expiry ? `Active until ${expiry}` : 'Lifetime membership';
    return {
      type: 'text',
      text: `✨ VIP Member\n${expiryLine}\n\nYou receive priority broadcast notifications when buyers post matching requests.`,
    };
  }
  return {
    type: 'text',
    text: `📋 Free Plan\n\nUpgrade to VIP for priority matching and more broadcast notifications.\n\nVisit Profindle → Package to upgrade.`,
  };
}
