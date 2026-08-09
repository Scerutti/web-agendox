'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/api/server';
import { actionError, actionOk, type ActionState } from '@/lib/actions';
import { optStr, str } from '@/lib/form';
import { parseWeekIntervals } from '@/lib/schedule';
import type { DayOfWeek } from '@agendox/domain';

export async function createResource(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  try {
    await serverFetch('/resources', {
      method: 'POST',
      body: JSON.stringify({
        name: str(fd, 'name'),
        type: str(fd, 'type'),
        color: optStr(fd, 'color'),
        description: optStr(fd, 'description'),
        userId: optStr(fd, 'userId'),
      }),
    });
    revalidatePath('/resources');
    return actionOk('Recurso creado');
  } catch (e) {
    return actionError(e);
  }
}

export async function updateResource(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const id = str(fd, 'id');
  try {
    await serverFetch(`/resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: str(fd, 'name'),
        type: str(fd, 'type'),
        color: optStr(fd, 'color'),
        description: optStr(fd, 'description'),
        userId: optStr(fd, 'userId'),
      }),
    });
    revalidatePath(`/resources/${id}`);
    revalidatePath('/resources');
    return actionOk('Recurso actualizado');
  } catch (e) {
    return actionError(e);
  }
}

export async function setResourceActive(id: string, active: boolean) {
  await serverFetch(`/resources/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
  revalidatePath(`/resources/${id}`);
  revalidatePath('/resources');
}

export async function saveSchedule(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const id = str(fd, 'resourceId');
  const week = parseWeekIntervals(fd.get('payload'));
  const entries = [];
  for (let d = 0; d < 7; d++) {
    for (const interval of week[d] ?? []) {
      entries.push({ dayOfWeek: d as DayOfWeek, startsAt: interval.start, endsAt: interval.end });
    }
  }
  try {
    await serverFetch(`/resources/${id}/schedule`, {
      method: 'PUT',
      body: JSON.stringify({ entries }),
    });
    revalidatePath(`/resources/${id}`);
    return actionOk('Horario guardado');
  } catch (e) {
    return actionError(e);
  }
}

export async function assignService(resourceId: string, serviceId: string) {
  await serverFetch(`/resources/${resourceId}/services`, {
    method: 'POST',
    body: JSON.stringify({ serviceId }),
  });
  revalidatePath(`/resources/${resourceId}`);
}

export async function unassignService(resourceId: string, serviceId: string) {
  await serverFetch(`/resources/${resourceId}/services/${serviceId}`, {
    method: 'DELETE',
  });
  revalidatePath(`/resources/${resourceId}`);
}

export async function createBlockedTime(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const resourceId = str(fd, 'resourceId');
  try {
    await serverFetch('/blocked-times', {
      method: 'POST',
      body: JSON.stringify({
        resourceId,
        // Enviamos el wall-clock local tal cual; el backend lo interpreta en la
        // zona horaria de la organización (no la del server).
        startsAt: str(fd, 'startsAt'),
        endsAt: str(fd, 'endsAt'),
        reason: optStr(fd, 'reason'),
        type: str(fd, 'type'),
      }),
    });
    revalidatePath(`/resources/${resourceId}`);
    return actionOk('Bloqueo creado');
  } catch (e) {
    return actionError(e);
  }
}

export async function deleteBlockedTime(id: string, resourceId: string) {
  await serverFetch(`/blocked-times/${id}`, { method: 'DELETE' });
  revalidatePath(`/resources/${resourceId}`);
}
