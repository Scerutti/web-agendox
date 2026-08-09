import { NextResponse } from 'next/server';
import { API_INTERNAL_URL } from '@/lib/env';
import { setAdminCookie } from '@/lib/auth/cookies';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { message: 'Email y contraseña son obligatorios' },
      { status: 400 },
    );
  }

  const r = await fetch(`${API_INTERNAL_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  const res = NextResponse.json({ superAdmin: data.superAdmin });
  setAdminCookie(res, data.accessToken, data.expiresAt);
  return res;
}
