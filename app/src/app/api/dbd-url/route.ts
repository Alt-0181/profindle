import { NextResponse } from 'next/server';
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

// Returns a short-lived signed URL for the signed-in user's OWN DBD file.
// The path is read from their company record server-side, so a user can never
// sign someone else's document.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = getAdmin();
  const { data: company } = await admin
    .from('companies')
    .select('dbd_certificate_url')
    .eq('user_id', user.id)
    .maybeSingle();

  const path = (company as any)?.dbd_certificate_url as string | null;
  if (!path) return NextResponse.json({ signedUrl: null });

  const { data: signed, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 300);
  if (error) return NextResponse.json({ signedUrl: null });

  return NextResponse.json({ signedUrl: signed?.signedUrl ?? null });
}
