'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/api/server';
import { actionError, actionOk, type ActionState } from '@/lib/actions';
import { optStr, str } from '@/lib/form';
import type { ClientStatus } from '@agendox/domain';

export async function createClient(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  try {
    await serverFetch('/clients', {
      method: 'POST',
      body: JSON.stringify({
        firstName: str(fd, 'firstName'),
        lastName: str(fd, 'lastName'),
        email: str(fd, 'email'),
        whatsapp: str(fd, 'whatsapp'),
        phone: optStr(fd, 'phone'),
        notes: optStr(fd, 'notes'),
      }),
    });
    revalidatePath('/clients');
    return actionOk('Cliente creado');
  } catch (e) {
    return actionError(e);
  }
}

export async function updateClient(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const id = str(fd, 'id');
  try {
    await serverFetch(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        firstName: str(fd, 'firstName'),
        lastName: str(fd, 'lastName'),
        whatsapp: str(fd, 'whatsapp'),
        phone: optStr(fd, 'phone'),
        notes: optStr(fd, 'notes'),
      }),
    });
    revalidatePath('/clients');
    return actionOk('Cliente actualizado');
  } catch (e) {
    return actionError(e);
  }
}

export async function setClientStatus(id: string, status: ClientStatus) {
  await serverFetch(`/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  revalidatePath('/clients');
}
