import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const projectId = formData.get('projectId') as string | null;
  const slotIndex = formData.get('slotIndex') as string | null;

  if (!file || !projectId || slotIndex === null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Verify the project belongs to this user
  const { data: project } = await supabase
    .from('portfolio_projects')
    .select('id')
    .eq('id', projectId)
    .single();
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${user.id}/${projectId}/${slotIndex}.${ext}`;

  const admin = getAdmin();
  const { error: uploadErr } = await admin.storage
    .from('portfolio-images')
    .upload(path, file, { upsert: true });

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const { data: urlData } = admin.storage.from('portfolio-images').getPublicUrl(path);
  return NextResponse.json({ url: urlData.publicUrl + '?v=' + Date.now() });
}
