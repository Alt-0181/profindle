import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdmin, resolveCollabRole } from '@/lib/collab-access';

// Company-info fields a collaborator may change. Deliberately excludes owner-only
// identity/billing/flags (name, name_th, user_id, premium, plan, verified,
// require_approval, id) so a crafted payload can't escalate.
const ALLOWED = new Set([
  'description', 'description_th', 'services', 'industry', 'province', 'address',
  'team_size', 'founded_year', 'website', 'phone', 'email', 'dbd_no', 'line_id',
  'buyer_only', 'logo_url', 'banner_url', 'banner_url_mobile',
  'banner_focus_x', 'banner_focus_y', 'banner_focus_mobile_x', 'banner_focus_mobile_y',
]);

function clean(payload: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload ?? {})) if (ALLOWED.has(k)) out[k] = v;
  return out;
}

// POST /api/collab/save-company  { companyId, payload }
// A collaborator saving My Company info. Applies live when approval is off,
// otherwise queues a pending change request for the owner to review.
export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const companyId = String(body.companyId ?? '').trim();
  if (!companyId) return NextResponse.json({ error: 'Missing company' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const admin = getAdmin();
  const role = await resolveCollabRole(admin, user.id, companyId);
  if (!role || !role.canEditCompany) return NextResponse.json({ error: 'Not allowed' }, { status: 403 });

  const payload = clean(body.payload ?? {});

  // Owner, or approval off → apply straight to the live company.
  if (role.isOwner || !role.requireApproval) {
    const { error } = await admin
      .from('companies')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', companyId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, queued: false });
  }

  // Collaborator + approval on → replace this author's pending company request.
  await admin
    .from('company_change_requests')
    .delete()
    .eq('company_id', companyId)
    .eq('author_id', user.id)
    .eq('entity', 'company')
    .eq('status', 'pending');
  const { error } = await admin.from('company_change_requests').insert({
    company_id: companyId,
    author_id: user.id,
    author_email: user.email ?? null,
    entity: 'company',
    op: 'update',
    payload,
    status: 'pending',
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, queued: true });
}
