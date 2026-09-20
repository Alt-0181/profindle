import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdmin, resolveCollabRole } from '@/lib/collab-access';

// POST /api/collab/review  { requestId, decision: 'approve' | 'reject' }
// Owner-only: approve a queued change (apply it live) or reject it (discard).
export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const requestId = String(body.requestId ?? '').trim();
  const decision = String(body.decision ?? '');
  if (!requestId || (decision !== 'approve' && decision !== 'reject')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const admin = getAdmin();
  const { data: cr } = await admin
    .from('company_change_requests')
    .select('id, company_id, entity, op, entity_id, payload, status')
    .eq('id', requestId)
    .maybeSingle();
  if (!cr) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if ((cr as any).status !== 'pending') return NextResponse.json({ error: 'Already reviewed' }, { status: 409 });

  const role = await resolveCollabRole(admin, user.id, (cr as any).company_id);
  if (!role || !role.isOwner) return NextResponse.json({ error: 'Owner only' }, { status: 403 });

  if (decision === 'approve') {
    const err = await applyChange(admin, cr as any);
    if (err) return NextResponse.json({ error: err }, { status: 500 });
  }

  await admin
    .from('company_change_requests')
    .update({ status: decision === 'approve' ? 'approved' : 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq('id', requestId);

  return NextResponse.json({ ok: true });
}

// Apply an approved change to the live tables. Returns an error string or null.
async function applyChange(admin: ReturnType<typeof getAdmin>, cr: {
  company_id: string; entity: string; op: string; entity_id: string | null; payload: Record<string, any> | null;
}): Promise<string | null> {
  const payload = cr.payload ?? {};

  if (cr.entity === 'company') {
    const { error } = await admin
      .from('companies')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', cr.company_id);
    return error?.message ?? null;
  }

  if (cr.entity === 'portfolio_project') {
    if (cr.op === 'delete') {
      if (!cr.entity_id) return 'Missing project id';
      const { error } = await admin.from('portfolio_projects').delete().eq('id', cr.entity_id).eq('company_id', cr.company_id);
      return error?.message ?? null;
    }
    if (cr.op === 'update') {
      if (!cr.entity_id) return 'Missing project id';
      const { error } = await admin.from('portfolio_projects').update(payload).eq('id', cr.entity_id).eq('company_id', cr.company_id);
      return error?.message ?? null;
    }
    // create
    const { error } = await admin.from('portfolio_projects').insert({ ...payload, company_id: cr.company_id });
    return error?.message ?? null;
  }

  return 'Unknown change type';
}
