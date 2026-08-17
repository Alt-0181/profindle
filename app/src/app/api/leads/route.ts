import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';

function getAdmin() {
  return adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

const VALID = ['interested', 'declined', 'no_reply'];

// PATCH /api/leads  { broadcastId, response: 'interested'|'declined'|'no_reply' }
// A provider records their response to a broadcast that matched their company.
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { broadcastId, response } = await request.json();
  if (!broadcastId || !VALID.includes(response)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Resolve the caller's own company — the response only applies to their match.
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!company) return NextResponse.json({ error: 'No company profile' }, { status: 400 });

  const admin = getAdmin();
  const { error } = await admin
    .from('broadcast_matches')
    .update({
      provider_response: response,
      responded_at: response === 'no_reply' ? null : new Date().toISOString(),
    })
    .eq('broadcast_id', broadcastId)
    .eq('provider_company_id', (company as { id: string }).id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
