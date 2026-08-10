import { NextResponse } from 'next/server';
import { apiUrl } from '@/lib/env';
import { setAuthCookies } from '@/lib/auth/cookies';

interface RegisterBody {
  organizationName?: string;
  slug?: string;
  timezone?: string;
  owner?: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as RegisterBody | null;

  if (
    !body?.organizationName ||
    !body?.slug ||
    !body?.timezone ||
    !body?.owner?.email ||
    !body?.owner?.password
  ) {
    return NextResponse.json(
      { message: 'Faltan datos obligatorios del negocio o del titular' },
      { status: 400 },
    );
  }

  const r = await fetch(apiUrl('/organizations/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  // Auto-login para dejar la sesión lista tras registrar.
  const lr = await fetch(apiUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: body.owner.email,
      password: body.owner.password,
    }),
  });

  if (!lr.ok) {
    // Registrado pero no se pudo autologuear: que el cliente vaya a /login.
    return NextResponse.json(
      { registered: true, organizationId: data.organizationId },
      { status: 201 },
    );
  }

  const ldata = await lr.json().catch(() => ({}));
  const res = NextResponse.json({ user: ldata.user }, { status: 201 });
  setAuthCookies(res, ldata);
  return res;
}
