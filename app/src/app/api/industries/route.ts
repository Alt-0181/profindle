import { NextResponse } from 'next/server';
import { INDUSTRIES, ALL_SERVICES } from '@/lib/mock/industries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (query) {
    const q = query.toLowerCase();
    const results = ALL_SERVICES.filter((s) =>
      s.service.toLowerCase().includes(q) || s.industry.toLowerCase().includes(q)
    ).slice(0, 10);
    return NextResponse.json({ services: results });
  }

  return NextResponse.json({ industries: INDUSTRIES });
}
