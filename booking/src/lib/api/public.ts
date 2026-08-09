import { ApiError, toApiError } from '@agendox/api-client';
import { API_INTERNAL_URL } from '../env';

async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_INTERNAL_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface PublicBranding {
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  publicTitle: string | null;
  publicDescription: string | null;
}

export interface PublicOrg {
  name: string;
  slug: string;
  timezone: string;
  publicBookingEnabled: boolean;
  branding: PublicBranding;
}

export interface PublicServiceOption {
  id: string;
  durationMinutes: number;
  price: number;
}

export interface PublicService {
  id: string;
  name: string;
  description: string | null;
  options: PublicServiceOption[];
}

export interface PublicResource {
  id: string;
  name: string;
  type: string;
  color: string | null;
}

export interface AvailabilitySlot {
  date: string;
  start: string;
  end: string;
  resourceId: string;
}

export interface AvailabilityResult {
  timeZone: string;
  durationMinutes: number;
  slots: AvailabilitySlot[];
}

export const getPublicServices = (slug: string) =>
  publicFetch<PublicService[]>(`/public/${slug}/services`);

export const getPublicResources = (slug: string, serviceId: string) =>
  publicFetch<PublicResource[]>(
    `/public/${slug}/resources?serviceId=${encodeURIComponent(serviceId)}`,
  );

export function getPublicAvailability(
  slug: string,
  params: {
    serviceId: string;
    serviceOptionId: string;
    resourceId?: string;
    fromDate: string;
    toDate: string;
  },
) {
  const qs = new URLSearchParams({
    serviceId: params.serviceId,
    serviceOptionId: params.serviceOptionId,
    fromDate: params.fromDate,
    toDate: params.toDate,
  });
  if (params.resourceId) qs.set('resourceId', params.resourceId);
  return publicFetch<AvailabilityResult>(
    `/public/${slug}/availability?${qs.toString()}`,
  );
}

/** Portada del negocio; null si el slug no existe. */
export async function getPublicOrg(slug: string): Promise<PublicOrg | null> {
  try {
    return await publicFetch<PublicOrg>(`/public/${slug}`);
  } catch (e) {
    if (e instanceof ApiError && e.isNotFound) return null;
    throw e;
  }
}
