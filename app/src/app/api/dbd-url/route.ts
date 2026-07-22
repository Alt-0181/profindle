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

// Returns a short-lived signed URL for the signed-in user's OWN DBD file.
// A caller may pass ?path=, but it's only honoured when the path is inside the
// user's own folder — otherwise (or if absent) we fall back to the path saved
// on their company row. Either way a user can never sign someone else's file.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = getAdmin();
  const requested = request.nextUrl.searchParams.get('path');
  const ownsPath = requested && (requested.startsWith(`${user.id}/`) || requested.startsWith(`${user.id}-`));

  let path = ownsPath ? requested : null;
  if (!path) {
    const { data: company } = await admin
      .from('companies')
      .select('dbd_certificate_url')
      .eq('user_id', user.id)
      .maybeSingle();
    path = (company as any)?.dbd_certificate_url ?? null;
  }
  if (!path) return NextResponse.json({ signedUrl: null });

  const { data: signed, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 300);
  if (error) return NextResponse.json({ signedUrl: null, error: error.message });

  return NextResponse.json({ signedUrl: signed?.signedUrl ?? null });
}
