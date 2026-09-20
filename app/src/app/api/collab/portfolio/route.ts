import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdmin, resolveCollabRole } from '@/lib/collab-access';

// Portfolio fields a collaborator may set. Excludes server-managed columns
// (company_id, views, sort_order, created_at). `id` is allowed only on create so
// the new row's id matches the already-uploaded image paths.
const ALLOWED = new Set([
  'title', 'client', 'confidential', 'year', 'budget', 'category', 'cover_color',
  'description', 'description_th', 'results', 'results_th', 'challenge', 'challenge_th',
  'images', 'services',
]);

function clean(payload: Record<string, any>, allowId: boolean): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload ?? {})) if (ALLOWED.has(k) || (allowId && k === 'id')) out[k] = v;
  return out;
}

// POST /api/collab/portfolio  { op: 'create'|'update'|'delete', companyId, projectId, payload? }
// A collaborator adding/editing/deleting a portfolio project. Applies live when
// approval is off, otherwise queues a change request for the owner.
export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const op = String(body.op ?? '');
  const companyId = String(body.companyId ?? '').trim();
  const projectId = String(body.projectId ?? '').trim();
  if (!['create', 'update', 'delete'].includes(op)) return NextResponse.json({ error: 'Bad op' }, { status: 400 });
  if (!companyId || !projectId) return NextResponse.json({ error: 'Missing ids' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const admin = getAdmin();
  const role = await resolveCollabRole(admin, user.id, companyId);
  if (!role || !role.canEditPortfolio) return NextResponse.json({ error: 'Not allowed' }, { status: 403 });

  const payload = op === 'delete' ? null : clean(body.payload ?? {}, op === 'create');

  // Owner, or approval off → apply straight to the live table.
  if (role.isOwner || !role.requireApproval) {
    if (op === 'create') {
      const { error } = await admin.from('portfolio_projects').insert({ ...payload, id: projectId, company_id: companyId });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (op === 'update') {
      const { error } = await admin.from('portfolio_projects').update(payload!).eq('id', projectId).eq('company_id', companyId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await admin.from('portfolio_projects').delete().eq('id', projectId).eq('company_id', companyId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, queued: false });
  }

  // Collaborator + approval on → replace this author's pending request for this
  // project, then queue the new one.
  await admin
    .from('company_change_requests')
    .delete()
    .eq('company_id', companyId)
    .eq('author_id', user.id)
    .eq('entity', 'portfolio_project')
    .eq('entity_id', projectId)
    .eq('status', 'pending');
  const { error } = await admin.from('company_change_requests').insert({
    company_id: companyId,
    author_id: user.id,
    author_email: user.email ?? null,
    entity: 'portfolio_project',
    op,
    entity_id: projectId,
    payload,
    status: 'pending',
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, queued: true });
}
