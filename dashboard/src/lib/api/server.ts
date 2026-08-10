import { cookies } from 'next/headers';
import { ApiError, toApiError } from '@agendox/api-client';
import { apiUrl } from '../env';
import { AT } from '../auth/cookies';

/**
 * Fetch autenticado al backend desde server components / route handlers.
 * Adjunta el access token de la cookie httpOnly. NO refresca cookies (eso lo
 * hace el middleware de forma proactiva); si el backend responde 401, lanza
 * ApiError y el llamador decide (los layouts protegidos redirigen a /login).
 */
export async function serverFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const store = await cookies();
  const token = store.get(AT)?.value;

  const res = await fetch(apiUrl(path), {
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

/**
 * Como serverFetch, pero devuelve null ante 403 (sin permiso para el rol) o
 * 404 (no existe). Útil en lecturas de páginas para no romper el render.
 */
export async function tryServerFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    return await serverFetch<T>(path, init);
  } catch (err) {
    if (err instanceof ApiError && (err.isForbidden || err.isNotFound)) {
      return null;
    }
    throw err;
  }
}
