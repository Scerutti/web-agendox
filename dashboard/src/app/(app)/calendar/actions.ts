'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@agendox/api-client';
import type { AppointmentAction } from '@agendox/domain';
import { serverFetch } from '@/lib/api/server';
import type { AvailabilityResult } from '@/lib/api/availability';
import type { ServiceOptionView } from '@/lib/api/services';
import type { ClientView } from '@/lib/api/clients';

export async function fetchServiceOptions(
  serviceId: string,
): Promise<ServiceOptionView[]> {
  return serverFetch<ServiceOptionView[]>(`/services/${serviceId}/options`);
}

/** Typeahead de clientes para el alta de turno (limita a 10 coincidencias). */
export async function searchClients(q: string): Promise<ClientView[]> {
  const params = new URLSearchParams({ limit: '10' });
  if (q.trim()) params.set('q', q.trim());
  const res = await serverFetch<{ items: ClientView[]; total: number }>(
    `/clients?${params.toString()}`,
  );
  return res.items;
}

export interface AvailabilityInput {
  serviceId: string;
  serviceOptionId: string;
  resourceId?: string;
  fromDate: string;
  toDate: string;
}

export async function fetchAvailability(
  input: AvailabilityInput,
): Promise<
  { ok: true; result: AvailabilityResult } | { ok: false; message: string }
> {
  const params = new URLSearchParams({
    serviceId: input.serviceId,
    serviceOptionId: input.serviceOptionId,
    fromDate: input.fromDate,
    toDate: input.toDate,
  });
  if (input.resourceId) params.set('resourceId', input.resourceId);
  try {
    const result = await serverFetch<AvailabilityResult>(
      `/availability?${params.toString()}`,
    );
    return { ok: true, result };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof ApiError ? e.message : 'No se pudo consultar disponibilidad',
    };
  }
}

export interface CreateAppointmentInput {
  serviceId: string;
  serviceOptionId: string;
  resourceId: string;
  clientId: string;
  startsAt: string;
  notes?: string;
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<{ ok: true } | { ok: false; conflict: boolean; message: string }> {
  try {
    await serverFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    revalidatePath('/calendar');
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, conflict: e.isConflict, message: e.message };
    }
    return { ok: false, conflict: false, message: 'No se pudo crear el turno' };
  }
}

const ACTION_PATH: Record<AppointmentAction, string> = {
  approve: 'approve',
  reject: 'reject',
  cancel: 'cancel',
  complete: 'complete',
  noShow: 'no-show',
};

export async function runAppointmentAction(
  id: string,
  action: AppointmentAction,
  reason?: string,
): Promise<{ ok: boolean; message: string }> {
  const needsReason = action === 'reject' || action === 'cancel';
  try {
    await serverFetch(`/appointments/${id}/${ACTION_PATH[action]}`, {
      method: 'POST',
      body: needsReason ? JSON.stringify({ reason }) : undefined,
    });
    revalidatePath('/calendar');
    revalidatePath('/deposits');
    return { ok: true, message: 'Turno actualizado' };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof ApiError ? e.message : 'No se pudo actualizar el turno',
    };
  }
}
