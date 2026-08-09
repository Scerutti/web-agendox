import { cookies } from 'next/headers';
import { ApiError, toApiError } from '@agendox/api-client';
import { API_INTERNAL_URL } from '../env';
import { AT } from '../auth/cookies';

/**
 * Fetch autenticado al backend desde server components / route handlers, con el
 * token de super admin de la cookie httpOnly. Ante 401 lanza ApiError; los
 * layouts protegidos redirigen a /login.
 */
export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
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

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export { ApiError };
