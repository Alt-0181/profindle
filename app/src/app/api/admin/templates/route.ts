import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'super_admin') return null;
  return user;
}

const DEFAULT_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Message',
    content: "ยินดีต้อนรับสู่ Profindle! 🎉\n\nเมื่อบัญชีของคุณเชื่อมต่อแล้ว คุณจะได้รับแจ้งเตือนที่นี่ทันที เมื่อมีลูกค้าโพสต์งานที่ตรงกับบริการของคุณ\n\nพิมพ์ \"status\" เพื่อดูสถานะแพ็กเกจและรหัสผู้ใช้ (User ID) ของคุณได้ทุกเมื่อ\n\n—\n\nWelcome to Profindle! 🎉\n\nOnce your account is linked, you'll get an instant alert here whenever a client posts a request matching your services.\n\nType \"status\" anytime to see your plan and your User ID.",
  },
  {
    id: 'verified',
    name: 'Verification Status Update',
    content: "✅ ยินดีด้วย! บริษัท {{company_name}} ได้รับการยืนยันแล้ว\n\nโปรไฟล์ของคุณจะแสดงเครื่องหมายยืนยัน (Verified) ให้ผู้ซื้อเห็นความน่าเชื่อถือของคุณมากขึ้น\n\n—\n\n✅ Congratulations! {{company_name}} is now verified.\n\nYour profile now shows the Verified badge, so buyers can see you're a trusted provider.",
  },
];

// GET /api/admin/templates — return the editable templates (DB rows merged with defaults)
export async function GET() {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = getAdmin();
  const { data } = await admin
    .from('line_message_templates')
    .select('id, name, content, updated_at');

  const dbMap = Object.fromEntries((data ?? []).map((t: { id: string; name: string; content: string; updated_at: string }) => [t.id, t]));
  const templates = DEFAULT_TEMPLATES.map(def => dbMap[def.id] ?? { ...def, updated_at: null });

  return NextResponse.json({ templates });
}

// PATCH /api/admin/templates — update one template { id, content }
export async function PATCH(request: NextRequest) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, content } = await request.json();
  if (!id || !content) {
    return NextResponse.json({ error: 'id and content are required' }, { status: 400 });
  }

  const validIds = ['welcome', 'verified'];
  if (!validIds.includes(id)) {
    return NextResponse.json({ error: 'Invalid template id' }, { status: 400 });
  }

  const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.id === id)!;
  const admin = getAdmin();
  const { error } = await admin
    .from('line_message_templates')
    .upsert({
      id,
      name: defaultTemplate.name,
      content: content.trim(),
      updated_at: new Date().toISOString(),
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
