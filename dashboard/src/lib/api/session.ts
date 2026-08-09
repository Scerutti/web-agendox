import { cookies } from 'next/headers';
import { ApiError } from '@agendox/api-client';
import { serverFetch } from './server';
import { AT } from '../auth/cookies';
import type { Organization, Session, SubscriptionInfo } from './types';

/** Sesión actual (GET /auth/me) o null si no hay token válido. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  if (!store.get(AT)?.value) return null;
  try {
    return await serverFetch<Session>('/auth/me');
  } catch (err) {
    if (err instanceof ApiError && err.isUnauthorized) return null;
    throw err;
  }
}

/** Organización actual (GET /organizations/current). */
export async function getCurrentOrganization(): Promise<Organization> {
  return serverFetch<Organization>('/organizations/current');
}

/**
 * Estado de trial/suscripción (GET /subscription). Solo Owner/Admin; para
 * otros roles el backend responde 403 → devolvemos null (el banner no aplica).
 */
export async function getSubscriptionStatus(): Promise<SubscriptionInfo | null> {
  try {
    return await serverFetch<SubscriptionInfo>('/subscription');
  } catch (err) {
    if (err instanceof ApiError && err.isForbidden) return null;
    throw err;
  }
}
