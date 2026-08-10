import { cookies } from 'next/headers';
import { ApiError, toApiError } from '@agendox/api-client';
import type { AppointmentStatus } from '@agendox/domain';
import { apiUrl } from '../env';
import { custCookieName } from '../customer/cookies';

export async function customerFetch<T>(
  slug: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
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
  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function hasCustomerSession(slug: string): Promise<boolean> {
  const store = await cookies();
  return !!store.get(custCookieName(slug))?.value;
}

export interface CustomerProfile {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  phone: string | null;
}

export interface TransferInfo {
  depositAmount: number;
  remainingAmount: number;
  bankName: string | null;
  accountHolder: string | null;
  alias: string | null;
  cbu: string | null;
  phone: string | null;
  instructions: string | null;
}

export interface CustomerAppointmentView {
  id: string;
  serviceName: string;
  resourceName: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  servicePrice: number;
  depositAmount: number | null;
  remainingAmount: number | null;
}

export interface CustomerAppointment extends CustomerAppointmentView {
  transfer: TransferInfo | null;
}

export async function getMe(slug: string): Promise<CustomerProfile | null> {
  try {
    return await customerFetch<CustomerProfile | null>(slug, '/portal/me');
  } catch (e) {
    if (e instanceof ApiError && e.isUnauthorized) return null;
    throw e;
  }
}

export const getMyAppointments = (slug: string) =>
  customerFetch<CustomerAppointmentView[]>(slug, '/portal/appointments');

export const getMyAppointment = (slug: string, id: string) =>
  customerFetch<CustomerAppointment>(slug, `/portal/appointments/${id}`);
