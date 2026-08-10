import { NextResponse } from 'next/server';
import { apiUrl } from '@/lib/env';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  if (!body?.email) {
    return NextResponse.json({ message: 'Email requerido' }, { status: 400 });
  }

  const r = await fetch(apiUrl(`/public/${slug}/otp/request`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email }),
  });
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}
