import { cookies } from 'next/headers';
import { API_INTERNAL_URL } from '../env';
import { AT } from '../auth/cookies';

/**
 * Reenvía una request al backend adjuntando el access token de la cookie
 * httpOnly. Preserva status y cuerpo. Usado por los proxies acotados que
 * habilitan el polling client-side (notificaciones/push).
 */
export async function proxyStaff(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const store = await cookies();
  const token = store.get(AT)?.value;
  const res = await fetch(`${API_INTERNAL_URL}${path}`, {
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
