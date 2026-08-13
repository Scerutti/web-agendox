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

/** Pantalla de identificación, con a dónde volver una vez adentro. */
export function loginUrl(slug: string, next?: string): string {
  const base = `/${slug}/ingresar`;
  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
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
 *
 * `next` es la ruta a la que se vuelve después de entrar: sin eso, quien abre el
 * link de un turno puntual termina en la lista y tiene que buscarlo de nuevo.
 */
export async function requireCustomerSession(slug: string, next?: string): Promise<void> {
  if (!(await hasCustomerSession(slug))) redirect(loginUrl(slug, next));
}

/**
 * Manda a identificarse de nuevo si el error es una sesión vencida; con
 * cualquier otro error no hace nada y deja que decida quien llama.
 *
 * Es el caso que no cubre {@link requireCustomerSession}, que sólo mira que la
 * cookie exista. Hoy la cookie y el token duran lo mismo, así que la ventana es
 * angosta, pero no es cero: el token puede vencer entre el chequeo y el pedido,
 * o dejar de validar si se rota `JWT_CUSTOMER_SECRET`. Ahí corresponde pedir el
 * código de nuevo, no mostrar un error.
 */
export function redirectIfSessionExpired(error: unknown, slug: string, next?: string): void {
  if (error instanceof ApiError && error.isUnauthorized) redirect(loginUrl(slug, next));
}

/** Estado de identificación del visitante, para saber si hay que pedirle el código. */
export interface CustomerSession {
  authenticated: boolean;
  /** `false` si nunca completó sus datos: hay que pedirle el perfil antes de reservar. */
  profileComplete: boolean;
  email: string | null;
}

const NO_SESSION: CustomerSession = {
  authenticated: false,
  profileComplete: false,
  email: null,
};

/**
 * Resuelve si el visitante ya está identificado en este negocio.
 *
 * No alcanza con mirar la cookie: hay que preguntarle a la API, porque el token
 * puede estar vencido. Y no sirve `getMe`, que devuelve `null` tanto para "no
 * autenticado" como para "autenticado pero sin perfil todavía" — acá esa
 * diferencia es justo lo que se necesita distinguir.
 *
 * Ante un error que no sea 401 se responde "sin sesión": como mucho se le pide
 * el código de nuevo, que es molesto pero no rompe la reserva.
 */
export async function getCustomerSession(slug: string): Promise<CustomerSession> {
  if (!(await hasCustomerSession(slug))) return NO_SESSION;
  try {
    const me = await customerFetch<CustomerProfile | null>(slug, '/portal/me');
    return { authenticated: true, profileComplete: me !== null, email: me?.email ?? null };
  } catch {
    return NO_SESSION;
  }
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
