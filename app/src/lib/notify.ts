import { pushMessage } from '@/lib/line';

export async function notifyAdminEmail(subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Profindle <noreply@profindle.com>',
      to: ['support@profindle.com'],
      subject,
      html,
    }),
  }).catch(() => {});
}

export async function notifyAdminLine(message: string): Promise<void> {
  const adminUid = process.env.LINE_ADMIN_UID;
  if (!adminUid) return;
  await pushMessage(adminUid, [{ type: 'text', text: message }]).catch(() => {});
}

export async function notifyAdmin(subject: string, html: string, lineMessage: string): Promise<void> {
  await Promise.allSettled([
    notifyAdminEmail(subject, html),
    notifyAdminLine(lineMessage),
  ]);
}
