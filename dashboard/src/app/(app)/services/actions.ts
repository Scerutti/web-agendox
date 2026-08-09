'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/api/server';
import { actionError, actionOk, type ActionState } from '@/lib/actions';
import { num, optStr, str } from '@/lib/form';

export async function createService(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  try {
    await serverFetch('/services', {
      method: 'POST',
      body: JSON.stringify({
        name: str(fd, 'name'),
        description: optStr(fd, 'description'),
      }),
    });
    revalidatePath('/services');
    return actionOk('Servicio creado');
  } catch (e) {
    return actionError(e);
  }
}

export async function updateService(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const id = str(fd, 'id');
  try {
    await serverFetch(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: str(fd, 'name'),
        description: optStr(fd, 'description'),
      }),
    });
    revalidatePath(`/services/${id}`);
    revalidatePath('/services');
    return actionOk('Servicio actualizado');
  } catch (e) {
    return actionError(e);
  }
}

export async function setServiceActive(id: string, active: boolean) {
  await serverFetch(`/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
  revalidatePath(`/services/${id}`);
  revalidatePath('/services');
}

export async function createOption(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const serviceId = str(fd, 'serviceId');
  try {
    await serverFetch(`/services/${serviceId}/options`, {
      method: 'POST',
      body: JSON.stringify({
        durationMinutes: num(fd, 'durationMinutes'),
        price: num(fd, 'price'),
      }),
    });
    revalidatePath(`/services/${serviceId}`);
    return actionOk('Opción creada');
  } catch (e) {
    return actionError(e);
  }
}

export async function updateOption(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const serviceId = str(fd, 'serviceId');
  const optionId = str(fd, 'optionId');
  try {
    await serverFetch(`/services/${serviceId}/options/${optionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        durationMinutes: num(fd, 'durationMinutes'),
        price: num(fd, 'price'),
      }),
    });
    revalidatePath(`/services/${serviceId}`);
    return actionOk('Opción actualizada');
  } catch (e) {
    return actionError(e);
  }
}

export async function setOptionActive(
  serviceId: string,
  optionId: string,
  active: boolean,
) {
  await serverFetch(`/services/${serviceId}/options/${optionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
  revalidatePath(`/services/${serviceId}`);
}
