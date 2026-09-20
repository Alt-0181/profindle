import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdmin, resolveCollabRole } from '@/lib/collab-access';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const projectId = formData.get('projectId') as string | null;
  const slotIndex = formData.get('slotIndex') as string | null;
  const bodyCompanyId = formData.get('companyId') as string | null;

  if (!file || !projectId || slotIndex === null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const admin = getAdmin();

  // Authorize by portfolio-edit rights on the target company. The project may
  // not exist yet (a collaborator adding a project under approval — the row is
  // created only when the owner approves), so fall back to the companyId passed
  // by the client and verify membership against that.
  const { data: project } = await admin
    .from('portfolio_projects')
    .select('id, company_id')
    .eq('id', projectId)
    .maybeSingle();
  const companyId = (project as any)?.company_id ?? bodyCompanyId ?? null;
  if (!companyId) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  const role = await resolveCollabRole(admin, user.id, companyId);
  if (!role || !role.canEditPortfolio) return NextResponse.json({ error: 'Not allowed' }, { status: 403 });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${user.id}/${projectId}/${slotIndex}.${ext}`;

  const { error: uploadErr } = await admin.storage
    .from('portfolio-images')
    .upload(path, file, { upsert: true });

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const { data: urlData } = admin.storage.from('portfolio-images').getPublicUrl(path);
  return NextResponse.json({ url: urlData.publicUrl + '?v=' + Date.now() });
}
