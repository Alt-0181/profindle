import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const type = searchParams.get('type') ?? 'providers';

  // Stub: return empty results — real implementation queries Supabase
  return NextResponse.json({
    query,
    type,
    results: [],
    total: 0,
  });
}
