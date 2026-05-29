import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email, otp } = await request.json();

  if (!email || !otp) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (otp === '000000') {
    return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 401 });
  }

  // In production, verify against Supabase Auth
  // For demo: any 6-digit code (except 000000) is valid
  return NextResponse.json({
    success: true,
    user: {
      id: 'demo-user-001',
      email,
      name: 'Somchai J.',
      company: 'Jaidee Solutions Co., Ltd.',
      plan: 'free',
    },
  });
}
