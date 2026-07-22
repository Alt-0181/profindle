import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

const BUCKET = 'company-docs';

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Private bucket (signed URLs only) — DBD certificates are sensitive.
async function ensureBucket(admin: ReturnType<typeof getAdmin>) {
  const { data } = await admin.storage.getBucket(BUCKET);
  if (!data) {
    await admin.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const admin = getAdmin();
  await ensureBucket(admin);

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf';
  const path = `${user.id}/dbd-${Date.now()}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadErr } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || 'application/octet-stream',
    upsert: true,
  });
  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  await admin.from('companies')
    .update({ dbd_certificate_url: path, dbd_certificate_name: file.name })
    .eq('user_id', user.id);

  const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 3600);

  return NextResponse.json({ path, signedUrl: signed?.signedUrl ?? null });
}
