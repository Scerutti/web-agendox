import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiError, toApiError } from '@agendox/api-client';
import type { AppointmentStatus } from '@agendox/domain';
import { apiUrl } from '../env';
import { clientIpHeaders } from '../client-ip';
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

export async function hasCustomerSession(slug: string): Promise<boolean> {
  const store = await cookies();
  return !!store.get(custCookieName(slug))?.value;
}

/**
 * Corta el render de una página del portal si no hay sesión de cliente.
 *
 * El layout del portal ya redirige, pero **no alcanza**: Next renderiza el
 * layout y la página en paralelo, así que la página igual dispara sus fetch
 * antes de que el redirect del layout se aplique. Sin token, la API contesta 401
 * y esa excepción sin manejar tapa al redirect — en dev queda el error en
 * consola y en producción es una pantalla de error en vez de volver a la página
 * del negocio.
 */
export async function requireCustomerSession(slug: string): Promise<void> {
  if (!(await hasCustomerSession(slug))) redirect(`/${slug}`);
}

/**
 * Vuelve a la página del negocio si el error es una sesión vencida; con
 * cualquier otro error no hace nada y deja que decida quien llama.
 *
 * Es el caso que no cubre {@link requireCustomerSession}: la cookie dura un día
 * pero el token adentro vale 30 minutos, así que hay una ventana larga en la que
 * la cookie está pero la API rechaza. Ahí corresponde pedir el código de nuevo,
 * no mostrar un error.
 */
export function redirectIfSessionExpired(error: unknown, slug: string): void {
  if (error instanceof ApiError && error.isUnauthorized) redirect(`/${slug}`);
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
  /** Nombre de la opción tal como estaba al reservar (snapshot del turno). */
  serviceOptionName: string;
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
