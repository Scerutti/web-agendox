'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@agendox/api-client';
import {
  getPublicAvailability,
  getPublicResources,
  type AvailabilityResult,
  type PublicResource,
} from '@/lib/api/public';
import { customerFetch, type CustomerAppointment } from '@/lib/api/customer';

export async function fetchResources(
  slug: string,
  serviceId: string,
): Promise<PublicResource[]> {
  return getPublicResources(slug, serviceId);
}

export interface AvailabilityInput {
  serviceId: string;
  serviceOptionId: string;
  resourceId?: string;
  fromDate: string;
  toDate: string;
}

export async function fetchAvailability(
  slug: string,
  input: AvailabilityInput,
): Promise<
  { ok: true; result: AvailabilityResult } | { ok: false; message: string }
> {
  try {
    const result = await getPublicAvailability(slug, input);
    return { ok: true, result };
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof ApiError ? e.message : 'No se pudo consultar disponibilidad',
    };
  }
}

export interface ProfileInput {
  firstName: string;
  lastName: string;
  whatsapp: string;
  phone?: string;
}

export async function saveProfile(
  slug: string,
  profile: ProfileInput,
): Promise<{ ok: boolean; message: string }> {
  try {
    await customerFetch(slug, '/portal/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
    return { ok: true, message: 'Perfil guardado' };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof ApiError ? e.message : 'No se pudo guardar el perfil',
    };
  }
}

export interface BookInput {
  serviceId: string;
  serviceOptionId: string;
  resourceId: string;
  startsAt: string;
  /** Idempotency key (UUID): evita reservas duplicadas por doble submit. */
  idempotencyKey?: string;
}

export async function book(
  slug: string,
  input: BookInput,
): Promise<
  | { ok: true; appointment: CustomerAppointment }
  | { ok: false; conflict: boolean; message: string }
> {
  try {
    const appointment = await customerFetch<CustomerAppointment>(
      slug,
      '/portal/appointments',
      { method: 'POST', body: JSON.stringify(input) },
    );
    revalidatePath(`/${slug}/portal`);
    return { ok: true, appointment };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, conflict: e.isConflict, message: e.message };
    }
    return { ok: false, conflict: false, message: 'No se pudo reservar' };
  }
}
