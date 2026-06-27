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
    content: "🎉 Welcome to Profindle! Your LINE account is now connected. You'll receive instant notifications for broadcast requests.",
  },
  {
    id: 'verified',
    name: 'Verification Status Update',
    content: '✅ Your company {{company_name}} has been verified! Your profile now shows the Verified badge.',
  },
  {
    id: 'broadcast',
    name: 'New Broadcast Request',
    content: '📢 New request: {{service_category}} | Budget: {{budget}} | Timeline: {{timeline}}\n\nFrom: {{buyer_company}}\n{{description}}',
  },
];

// GET /api/admin/templates — return all 3 templates (DB rows merged with defaults)
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

  const validIds = ['welcome', 'verified', 'broadcast'];
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
