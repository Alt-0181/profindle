import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // In production, send OTP via Supabase Auth or email provider
  // For demo: always succeed
  return NextResponse.json({ success: true, message: 'OTP sent' });
}
