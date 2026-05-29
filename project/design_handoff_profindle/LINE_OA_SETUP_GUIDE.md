# LINE Official Account — Setup Guide for Profindle

This is a step-by-step guide for connecting your Profindle backend to LINE Official Account (OA) so you can:
1. **Push notifications** to service providers when matching broadcasts arrive
2. Send **welcome messages** when a provider links their LINE account
3. Auto-reply to support messages

---

## Step 1 — Create a LINE Official Account

1. Go to **[https://manager.line.biz](https://manager.line.biz)**
2. Sign in with your personal LINE account
3. Click **"Create"** → choose **"General Account"**
4. Fill in:
   - **Account name**: `Profindle` (this is what users see)
   - **Email**, **Industry** (Computer/IT or Business Services), **Phone**
   - **Country**: Thailand
5. Click **"Create"**
6. After creation, you'll get a unique **LINE OA ID** like `@profindle` (you can customize this later — but only once for free, then it costs money)

---

## Step 2 — Enable Messaging API

The default LINE OA only sends manual broadcasts. To programmatically push messages from Profindle, you need to enable the **Messaging API**.

1. In LINE Official Account Manager → **Settings (gear icon)** → **Messaging API**
2. Click **"Enable Messaging API"**
3. You'll be asked to create a **LINE Developers Provider**:
   - Provider name: `Profindle Co.` (or your company name)
4. Agree to the terms → click **"OK"**
5. You now have an OA with API access

---

## Step 3 — Get Your Credentials

These are the 3 keys your backend needs:

1. Go to **[https://developers.line.biz/console/](https://developers.line.biz/console/)**
2. Select your provider → select your channel (the one created in Step 2)
3. Go to the **"Messaging API"** tab

You'll find:

| Credential | Where | What it's for |
|---|---|---|
| **Channel ID** | "Basic settings" tab | Identifies your channel |
| **Channel Secret** | "Basic settings" tab | Verifies webhook authenticity |
| **Channel Access Token (long-lived)** | "Messaging API" tab → click "Issue" | Sends messages via API |

**Save these in your backend env vars:**
```env
LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=abc123...
LINE_CHANNEL_ACCESS_TOKEN=xyz789...
```

> ⚠️ **Never commit these to git.** Use `.env` + `.gitignore`.

---

## Step 4 — Disable Auto-Reply (Important!)

By default, LINE OA sends a generic auto-reply when users message you. You need to turn this off so your webhook handles messages instead.

1. In LINE OA Manager → **Settings** → **Response settings**
2. Set **"Chat"** to **ON**
3. Set **"Auto-response"** to **OFF**
4. Set **"Webhooks"** to **ON**
5. Save

---

## Step 5 — Set the Webhook URL

Once your backend has an endpoint, register it here:

1. In LINE Developers Console → your channel → **"Messaging API"** tab
2. Scroll to **"Webhook settings"**
3. Set **Webhook URL**: `https://yourapp.com/api/line/webhook`
   - Must be **HTTPS** (LINE rejects HTTP)
   - For local dev, use **ngrok**: `ngrok http 3000` → use the https URL it gives you
4. Click **"Verify"** — LINE will hit your endpoint and expect a `200 OK`
5. Turn **"Use webhook"** to **ON**

---

## Step 6 — How LINE User IDs Work

To send a push message to a specific user, you need their **LINE User ID** (looks like `Ua1b2c3d4...` — 33 characters starting with `U`).

There are **two ways** to get it:

### Option A — Manual entry (current Profindle flow)
1. User opens LINE app → **Profile** → tap their name → **User ID**
2. They copy it and paste into Settings → LINE Connect on Profindle
3. Your backend saves it to the `users.line_user_id` column

### Option B — LINE Login OAuth (better UX, optional)
1. User clicks "Connect with LINE" button on Profindle
2. They're redirected to LINE login → grant permission → redirected back
3. Your backend receives their `userId` automatically via OAuth callback
4. Requires creating a separate **LINE Login channel** in the Developers Console

> **Recommendation:** Start with Option A (already designed in your Settings page). Add Option B later if friction is too high.

---

## Step 7 — Send a Push Message (Code Example)

Here's how your backend pushes a broadcast notification to a provider:

```javascript
// Node.js / Next.js API route example
import { Client } from '@line/bot-sdk';

const lineClient = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
});

export async function sendBroadcastNotification(provider, broadcast) {
  const message = {
    type: 'text',
    text:
      `📢 New Broadcast Request\n\n` +
      `Service: ${broadcast.service}\n` +
      `Client: ${broadcast.client || 'Not specified'}\n` +
      `Budget: ${broadcast.budget}\n` +
      `Timeline: ${broadcast.timeline}\n\n` +
      `${broadcast.description}`,
  };

  await lineClient.pushMessage(provider.line_user_id, message);
}
```

Install the SDK: `npm install @line/bot-sdk`

For richer messages (cards with buttons), use [**Flex Messages**](https://developers.line.biz/en/docs/messaging-api/using-flex-messages/) — they're like Facebook Messenger cards.

---

## Step 8 — Handle Incoming Messages (Webhook)

When a user messages your OA (e.g. saying "hi"), LINE POSTs to your webhook URL.

```javascript
// /api/line/webhook (Next.js API route)
import { middleware } from '@line/bot-sdk';

export const config = { api: { bodyParser: false } }; // LINE requires raw body

export default async function handler(req, res) {
  const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
  };

  middleware(config)(req, res, async () => {
    const events = req.body.events;

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userId = event.source.userId;
        const text = event.message.text;

        // Reply with their LINE User ID (handy for them to copy into Profindle)
        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: `Your LINE User ID is:\n${userId}\n\nCopy this into Profindle → Settings → LINE Connect.`,
        });
      }
    }

    res.status(200).end();
  });
}
```

---

## Step 9 — Verify Webhook Signature (Security)

LINE signs every webhook with your `channelSecret`. **Always verify** — otherwise anyone could fake notifications to your backend.

The `@line/bot-sdk` middleware above does this automatically. If you write your own handler, do:

```javascript
import crypto from 'crypto';

function verifySignature(rawBody, signature, channelSecret) {
  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(rawBody)
    .digest('base64');
  return hash === signature;
}

// In handler:
const signature = req.headers['x-line-signature'];
if (!verifySignature(rawBody, signature, process.env.LINE_CHANNEL_SECRET)) {
  return res.status(401).send('Invalid signature');
}
```

---

## Step 10 — Test the Full Flow

1. Add your LINE OA as a friend (scan QR or search `@profindle`)
2. From your backend, run a test push:
   ```javascript
   await lineClient.pushMessage('YOUR_OWN_LINE_USER_ID', { type:'text', text:'Hello from Profindle!' });
   ```
3. You should receive it on LINE within 1 second
4. Now test the full broadcast flow:
   - Buyer sends broadcast in Profindle
   - Backend finds matching providers (by service + verified status)
   - Backend pushes to each provider's `line_user_id`
   - Provider opens LINE → sees the request → taps reply → contacts buyer

---

## Pricing (LINE Official Account)

| Plan | Free messages/mo | Cost |
|---|---|---|
| **Free** | 200 | ฿0 |
| **Light** | 5,000 | ฿1,200/mo |
| **Standard** | 25,000 | ฿4,500/mo |

> 1 broadcast = 1 message per recipient. If 50 providers match, that's 50 messages.

Start on **Free**, upgrade once you have ~80 broadcasts/mo in production.

Reference: [LINE Official Account Plans (TH)](https://www.linebiz.com/th/service/line-account-connect/)

---

## Common Gotchas

| Problem | Fix |
|---|---|
| Webhook returns 500 | LINE will retry 3 times then stop — fix your server, then re-enable webhook in console |
| Push message fails with 403 | User has blocked your OA — they need to re-add as friend |
| Push message fails with 429 | Rate limit hit — implement queue + retry with exponential backoff |
| User can't find their LINE User ID | Tell them to upgrade LINE app — older versions don't show it |
| Verify webhook fails | Your URL must be HTTPS + reachable + return 200 in <10s |
| Auto-reply still sending | Double-check Step 4 — both "Auto-response" AND "Greeting message" should be OFF |

---

## Useful Links

- [LINE Developers Console](https://developers.line.biz/console/)
- [LINE OA Manager (Thai)](https://manager.line.biz)
- [Messaging API reference](https://developers.line.biz/en/reference/messaging-api/)
- [Flex Message Simulator](https://developers.line.biz/flex-simulator/) — design rich cards visually
- [Official Node.js SDK](https://github.com/line/line-bot-sdk-nodejs)
