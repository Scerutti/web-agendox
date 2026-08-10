import { cookies } from 'next/headers';
import { apiUrl } from '../env';
import { custCookieName } from '../customer/cookies';

/** Reenvía al backend adjuntando el customer token de la cookie del slug. */
export async function proxyCustomer(
  slug: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const store = await cookies();
  const token = store.get(custCookieName(slug))?.value;
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  const body = await res.text();
  return new Response(body || null, {
    status: res.status,
    headers: {
      'content-type': res.headers.get('content-type') ?? 'application/json',
    },
  });
}
