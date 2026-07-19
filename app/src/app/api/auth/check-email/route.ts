import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') return NextResponse.json({ exists: false });

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const exists = (data?.users ?? []).some(
      u => u.email?.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
