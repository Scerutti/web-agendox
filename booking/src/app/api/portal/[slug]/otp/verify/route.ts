import { NextResponse } from 'next/server';
import { API_INTERNAL_URL } from '@/lib/env';
import { setCustomerCookie } from '@/lib/customer/cookies';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    code?: string;
  } | null;
  if (!body?.email || !body?.code) {
    return NextResponse.json(
      { message: 'Email y código requeridos' },
      { status: 400 },
    );
  }

  const r = await fetch(`${API_INTERNAL_URL}/public/${slug}/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email, code: body.code }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  const res = NextResponse.json({ profileComplete: data.profileComplete });
  setCustomerCookie(res, slug, data.token);
  return res;
}
