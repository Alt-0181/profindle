import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdmin, resolveCollabRole } from '@/lib/collab-access';

// POST /api/collab/approval-setting  { companyId, requireApproval }
// Owner-only: turn the "collaborator changes need my approval" gate on/off.
export async function POST(request: NextRequest) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const companyId = String(body.companyId ?? '').trim();
  const requireApproval = !!body.requireApproval;
  if (!companyId) return NextResponse.json({ error: 'Missing company' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const admin = getAdmin();
  const role = await resolveCollabRole(admin, user.id, companyId);
  if (!role || !role.isOwner) return NextResponse.json({ error: 'Owner only' }, { status: 403 });

  const { error } = await admin.from('companies').update({ require_approval: requireApproval }).eq('id', companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, requireApproval });
}
