import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { pushMessage, makeWelcomeMessage } from '@/lib/line';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lineUserId } = await request.json();
  if (!lineUserId || !/^U[a-f0-9]{32}$/.test(lineUserId)) {
    return NextResponse.json({ error: 'Invalid LINE User ID format' }, { status: 400 });
  }

  const { error } = await supabase.from('companies').update({ line_user_id: lineUserId }).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send welcome message (best-effort)
  try {
    await pushMessage(lineUserId, [makeWelcomeMessage(lineUserId)]);
  } catch {
    // Welcome push failure is non-fatal
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase.from('companies').update({ line_user_id: null }).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
