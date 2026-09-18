import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

function inviteEmailHtml(lang: string, companyName: string, joinUrl: string, ownerEmail: string): string {
  const th = lang === 'th';
  const co = companyName || (th ? 'บริษัท' : 'a company');
  const inviter = ownerEmail || (th ? 'เจ้าของบริษัท' : 'the company owner');
  const heading = th ? 'คุณได้รับคำเชิญให้ร่วมจัดการ' : 'You’ve been invited to help manage';
  const body = th
    ? `<b>${inviter}</b> ได้เชิญให้ช่วยจัดการข้อมูลบริษัทและผลงานของ <b>${co}</b> บน Profindle กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านและเริ่มใช้งานได้ทันที`
    : `<b>${inviter}</b> has invited you to help manage <b>${co}</b>’s company info and portfolio on Profindle. Click the button below to set a password and get started right away.`;
  const cta = th ? 'ตั้งรหัสผ่าน & เข้าร่วม' : 'Set password & join';
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
        <p style="font-size:12px;color:#9AA0AE;line-height:1.6;margin:22px 0 0;">${ignore}</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

// POST /api/team/invite  { email, canEditCompany, canEditPortfolio, lang? }
// Only a company OWNER may invite. Creates/updates a pending membership and
// emails a self-contained join link (our own Resend email — no dependency on
// Supabase's invite magic link, so it delivers to any address, new or existing).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const email = String(body.email ?? '').trim().toLowerCase();
  const canEditCompany = !!body.canEditCompany;
  const canEditPortfolio = !!body.canEditPortfolio;
  const lang = body.lang === 'en' ? 'en' : 'th';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (!canEditCompany && !canEditPortfolio) return NextResponse.json({ error: 'Pick at least one permission' }, { status: 400 });
  if (email === (user.email ?? '').toLowerCase()) return NextResponse.json({ error: 'That is your own email' }, { status: 400 });

  const admin = getAdmin();

  // Caller must OWN a company.
  const { data: company } = await admin
    .from('companies').select('id, name, name_th').eq('user_id', user.id).maybeSingle();
  if (!company) return NextResponse.json({ error: 'Only a company owner can invite collaborators' }, { status: 403 });

  // Upsert the pending membership; its row id doubles as the invite token (a
  // random uuid — not enumerable), so no extra schema is needed.
  const { data: memberRow, error: upErr } = await admin.from('company_members').upsert({
    company_id: (company as any).id,
    invited_email: email,
    role: 'collaborator',
    can_edit_company: canEditCompany,
    can_edit_portfolio: canEditPortfolio,
    status: 'pending',
    invited_by: user.id,
  }, { onConflict: 'company_id,invited_email' }).select('id').single();
  if (upErr || !memberRow) return NextResponse.json({ error: upErr?.message ?? 'Could not create invite' }, { status: 500 });

  const origin = new URL(request.url).origin;
  const joinUrl = `${origin}/${lang}/join?token=${(memberRow as { id: string }).id}`;
  const companyName = ((company as any).name_th || (company as any).name) ?? '';

  // Send our own Resend email (domain already verified for this project).
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
          to: [email],
          subject: lang === 'th'
            ? `คุณได้รับเชิญให้ช่วยจัดการ${companyName ? ' ' + companyName : ''} บน Profindle`
            : `You're invited to help manage ${companyName || 'a company'} on Profindle`,
          html: inviteEmailHtml(lang, companyName, joinUrl, (user.email ?? '').toLowerCase()),
        }),
      });
      if (res.ok) emailSent = true;
      else emailError = `resend ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`;
    } catch (e) {
      emailError = (e as Error)?.message ?? 'email request threw';
    }
  }
  console.error('[team/invite] result', { email, joinUrl, emailSent, emailError });

  return NextResponse.json({ ok: true, emailSent, emailError });
}
