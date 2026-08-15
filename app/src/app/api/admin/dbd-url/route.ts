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

// Super-admin only: returns a short-lived signed URL for ANY company's DBD
// document (the owner-scoped /api/dbd-url can't view other companies' files, so
// the admin verification queue needs this).
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const path = request.nextUrl.searchParams.get('path');
  if (!path) return NextResponse.json({ signedUrl: null });

  const admin = getAdmin();
  const { data: signed, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 300);
  if (error) return NextResponse.json({ signedUrl: null, error: error.message });

  return NextResponse.json({ signedUrl: signed?.signedUrl ?? null });
}
