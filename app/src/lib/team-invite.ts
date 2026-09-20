import type { SupabaseClient } from '@supabase/supabase-js';

// Branded HTML for the collaborator invite email.
export function inviteEmailHtml(lang: string, companyName: string, joinUrl: string, ownerEmail: string): string {
  const th = lang === 'th';
  const co = companyName || (th ? 'บริษัท' : 'a company');
  const inviter = ownerEmail || (th ? 'เจ้าของบริษัท' : 'the company owner');
  const heading = th ? 'คุณได้รับคำเชิญให้ร่วมจัดการ' : 'You’ve been invited to help manage';
  const body = th
    ? `<b>${inviter}</b> ได้เชิญให้ช่วยจัดการข้อมูลบริษัทและผลงานของ <b>${co}</b> บน Profindle กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านและเริ่มใช้งานได้ทันที`
    : `<b>${inviter}</b> has invited you to help manage <b>${co}</b>’s company info and portfolio on Profindle. Click the button below to set a password and get started right away.`;
  const cta = th ? 'ตั้งรหัสผ่าน & เข้าร่วม' : 'Set password & join';
  // Decline lands on a confirm page (…&decline=1), never a one-click action —
  // email clients prefetch links, so a direct decline URL would auto-cancel
  // invites nobody meant to decline.
  const declineUrl = `${joinUrl}${joinUrl.includes('?') ? '&' : '?'}decline=1`;
  const declineText = th ? 'ไม่ต้องการเข้าร่วม? ปฏิเสธคำเชิญ' : 'Don’t want to join? Decline this invitation';
  const ignore = th
    ? `หากคุณไม่ได้รับแจ้งจากทาง ${inviter} ให้เป็นผู้ที่มีสิทธิ์จัดการข้อมูลของ ${co} คุณสามารถเพิกเฉยอีเมลฉบับนี้ได้เลย`
    : `If ${inviter} didn’t ask you to help manage ${co}’s information, you can safely ignore this email.`;
  return `<!doctype html><html><body style="margin:0;background:#F4F5F7;font-family:'Helvetica Neue',Arial,sans-serif;padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="440" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #E4E7ED;overflow:hidden;">
      <tr><td style="background:linear-gradient(135deg,#0F6F73,#1A9DA3);padding:22px 28px;">
        <span style="color:#ffffff;font-size:18px;font-weight:700;">Profindle</span>
      </td></tr>
      <tr><td style="padding:28px;">
        <div style="font-size:18px;font-weight:700;color:#171A21;margin-bottom:6px;">${heading} ${co}</div>
        <p style="font-size:14px;color:#4B5563;line-height:1.6;margin:0 0 22px;">${body}</p>
        <a href="${joinUrl}" style="display:inline-block;background:#0F6F73;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px;">${cta}</a>
        <p style="font-size:13px;margin:18px 0 0;"><a href="${declineUrl}" style="color:#6B7385;text-decoration:underline;">${declineText}</a></p>
        <p style="font-size:12px;color:#9AA0AE;line-height:1.6;margin:16px 0 0;">${ignore}</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

export interface SendInviteOpts {
  companyId: string;
  companyName: string;
  email: string;
  canEditCompany: boolean;
  canEditPortfolio: boolean;
  lang: 'th' | 'en';
  origin: string;
  inviterId: string;
  inviterEmail: string;
}

/**
 * Upsert a pending collaborator membership and email a self-contained join
 * link (our own Resend email — no dependency on Supabase's invite magic link).
 * Shared by /api/team/invite and /api/team/quick-invite. `admin` must be a
 * service-role client. Returns whether the row was written and whether the
 * email sent (with the reason if not — for logs, not the UI).
 */
export async function sendCollaboratorInvite(
  admin: SupabaseClient,
  o: SendInviteOpts,
): Promise<{ ok: boolean; error?: string; emailSent: boolean; emailError: string }> {
  const { data: memberRow, error: upErr } = await admin.from('company_members').upsert({
    company_id: o.companyId,
    invited_email: o.email,
    role: 'collaborator',
    can_edit_company: o.canEditCompany,
    can_edit_portfolio: o.canEditPortfolio,
    status: 'pending',
    invited_by: o.inviterId,
  }, { onConflict: 'company_id,invited_email' }).select('id').single();
  if (upErr || !memberRow) return { ok: false, error: upErr?.message ?? 'Could not create invite', emailSent: false, emailError: '' };

  const joinUrl = `${o.origin}/${o.lang}/join?token=${(memberRow as { id: string }).id}`;

  let emailSent = false;
  let emailError = '';
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    emailError = 'RESEND_API_KEY not configured on this deployment';
  } else {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Profindle <noreply@profindle.com>',
          to: [o.email],
          subject: o.lang === 'th'
            ? `คุณได้รับเชิญให้ช่วยจัดการ${o.companyName ? ' ' + o.companyName : ''} บน Profindle`
            : `You're invited to help manage ${o.companyName || 'a company'} on Profindle`,
          html: inviteEmailHtml(o.lang, o.companyName, joinUrl, o.inviterEmail),
        }),
      });
      if (res.ok) emailSent = true;
      else emailError = `resend ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`;
    } catch (e) {
      emailError = (e as Error)?.message ?? 'email request threw';
    }
  }
  console.error('[team-invite] result', { email: o.email, joinUrl, emailSent, emailError });
  return { ok: true, emailSent, emailError };
}
