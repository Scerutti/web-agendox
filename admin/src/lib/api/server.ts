import { cookies } from 'next/headers';
import { ApiError, toApiError } from '@agendox/api-client';
import { apiUrl } from '../env';
import { clientIpHeaders } from '../client-ip';
import { AT } from '../auth/cookies';

/**
 * Fetch autenticado al backend desde server components / route handlers, con el
 * token de super admin de la cookie httpOnly. Ante 401 lanza ApiError; los
 * layouts protegidos redirigen a /login.
 */
export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const store = await cookies();
  const token = store.get(AT)?.value;

  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await clientIpHeaders()),
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export { ApiError };
