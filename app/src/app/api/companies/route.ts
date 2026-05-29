import { NextRequest, NextResponse } from 'next/server';

const MOCK_COMPANIES = [
  {
    id: '1',
    nameEn: 'Jaidee Solutions Co., Ltd.',
    nameTh: 'บริษัท ใจดี โซลูชั่นส์ จำกัด',
    industry: 'Technology',
    province: 'Bangkok',
    verified: true,
    premium: false,
    services: ['Web Development', 'Mobile Apps'],
    views: 142,
    rating: 4.8,
  },
  {
    id: '2',
    nameEn: 'Creative Spark Agency',
    nameTh: 'ครีเอทีฟ สปาร์ค',
    industry: 'Creative & Branding',
    province: 'Bangkok',
    verified: true,
    premium: true,
    services: ['Brand Identity Design', 'Graphic Design'],
    views: 289,
    rating: 4.9,
  },
  {
    id: '3',
    nameEn: 'Digital Growth Thailand',
    nameTh: 'ดิจิทัล โกรท ไทยแลนด์',
    industry: 'Digital Marketing',
    province: 'Chiang Mai',
    verified: false,
    premium: false,
    services: ['SEO & Content Marketing', 'Social Media'],
    views: 67,
    rating: 4.5,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const province = searchParams.get('province');
  const verifiedOnly = searchParams.get('verified') === 'true';

  let results = MOCK_COMPANIES;

  if (query) {
    results = results.filter(
      (c) =>
        c.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        c.services.some((s) => s.toLowerCase().includes(query.toLowerCase()))
    );
  }

  if (province) {
    results = results.filter((c) => c.province === province);
  }

  if (verifiedOnly) {
    results = results.filter((c) => c.verified);
  }

  return NextResponse.json({ companies: results, total: results.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // In production, save to Supabase
  return NextResponse.json({ id: Date.now().toString(), ...body }, { status: 201 });
}
