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

// Streams the signed-in user's OWN DBD file back with an attachment header, so
// the browser downloads it directly from our origin — no signed-URL/CORS step.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = getAdmin();
  const requested = request.nextUrl.searchParams.get('path');
  const ownsPath = requested && (requested.startsWith(`${user.id}/`) || requested.startsWith(`${user.id}-`));

  const { data: company } = await admin
    .from('companies')
    .select('dbd_certificate_url, dbd_certificate_name')
    .eq('user_id', user.id)
    .maybeSingle();

  const path = ownsPath ? requested! : ((company as any)?.dbd_certificate_url ?? null);
  if (!path) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await admin.storage.from(BUCKET).download(path);
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const name = (company as any)?.dbd_certificate_name || 'DBD_Certificate.pdf';
  const buf = await data.arrayBuffer();
  return new Response(buf, {
    headers: {
      'Content-Type': data.type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"`,
    },
  });
}
