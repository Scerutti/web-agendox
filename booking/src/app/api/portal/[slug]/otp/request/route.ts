import { NextResponse } from 'next/server';
import { apiUrl } from '@/lib/env';
import { clientIpHeaders } from '@/lib/client-ip';

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
    // La IP del visitante viaja al backend: su tope por IP tiene que contar por
    // persona, no por deploy de Next (ver `lib/client-ip.ts`).
    headers: { 'Content-Type': 'application/json', ...(await clientIpHeaders(req)) },
    body: JSON.stringify({ email: body.email }),
  });
  const data = await r.json().catch(() => ({}));
  // `Retry-After` es lo único que dice cuánto esperar cuando el 429 lo tira el
  // rate limiter del framework (los 429 del dominio traen `retryAfterSeconds`
  // en el cuerpo). Sin reenviarla, el wizard adivinaba la espera.
  const retryAfter = r.headers.get('retry-after');
  return NextResponse.json(data, {
    status: r.status,
    headers: retryAfter ? { 'retry-after': retryAfter } : undefined,
  });
}
