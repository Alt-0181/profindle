import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path) return new NextResponse('Missing path', { status: 400 });

  const { data, error } = await getAdmin().storage.from('portfolio-images').download(path);
  if (error || !data) return new NextResponse('Not found', { status: 404 });

  const buffer = await data.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': data.type || 'image/jpeg',
      'Cache-Control': 'no-store',
    },
  });
}
