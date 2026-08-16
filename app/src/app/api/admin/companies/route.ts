import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { pushMessage } from '@/lib/line';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Fallback if the editable 'verified' template (Super Admin → LINE Templates)
// is missing/empty. {{company_name}} is substituted before sending.
const DEFAULT_VERIFIED =
  '✅ ยินดีด้วย! บริษัท {{company_name}} ได้รับการยืนยันแล้ว\n\n' +
  'โปรไฟล์ของคุณจะแสดงเครื่องหมายยืนยัน (Verified) ให้ผู้ซื้อเห็นความน่าเชื่อถือของคุณมากขึ้น\n\n' +
  '—\n\n' +
  '✅ Congratulations! {{company_name}} is now verified.\n\n' +
  "Your profile now shows the Verified badge, so buyers can see you're a trusted provider.";

// Best-effort LINE push when a company is verified. Never throws.
async function notifyVerified(admin: ReturnType<typeof getAdmin>, companyId: string) {
  try {
    const { data: company } = await admin
      .from('companies')
      .select('name, name_th, line_user_id')
      .eq('id', companyId)
      .maybeSingle();
    const lineUserId = (company as { line_user_id?: string } | null)?.line_user_id;
    if (!lineUserId) return;

    const { data: tpl } = await admin
      .from('line_message_templates')
      .select('content')
      .eq('id', 'verified')
      .maybeSingle();

    const name = (company as any)?.name_th || (company as any)?.name || 'บริษัทของคุณ / your company';
    const template = (tpl as { content?: string } | null)?.content?.trim() || DEFAULT_VERIFIED;
    const text = template.replace(/\{\{company_name\}\}/g, name);
    await pushMessage(lineUserId, [{ type: 'text', text }]);
  } catch {
    // Notification failure must not fail the verification itself.
  }
}

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (user.user_metadata?.role !== 'super_admin') return null;
  return user;
}

// PATCH /api/admin/companies  { companyId, field: 'verified'|'premium', value: boolean }
export async function PATCH(request: NextRequest) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { companyId, field, value } = await request.json();
  if (!companyId || !['verified', 'premium', 'line_user_id'].includes(field)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const admin = getAdmin();
  const { error } = await admin
    .from('companies')
    .update({ [field]: value })
    .eq('id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Tell the provider (via LINE) the moment they're verified.
  if (field === 'verified' && value === true) {
    await notifyVerified(admin, companyId);
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/companies  { companyId }
export async function DELETE(request: NextRequest) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { companyId } = await request.json();
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

  const admin = getAdmin();
  const { error } = await admin.from('companies').delete().eq('id', companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
