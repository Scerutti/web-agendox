'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, serverFetch } from '@/lib/api/server';

async function setStatus(
  id: string,
  action: 'suspend' | 'reactivate',
): Promise<{ ok: boolean; message: string }> {
  try {
    await serverFetch(`/admin/organizations/${id}/${action}`, { method: 'POST' });
    revalidatePath(`/organizations/${id}`);
    revalidatePath('/organizations');
    revalidatePath('/');
    return {
      ok: true,
      message: action === 'suspend' ? 'Organización suspendida' : 'Organización reactivada',
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof ApiError ? e.message : 'No se pudo actualizar la organización',
    };
  }
}

export async function suspendOrganization(id: string) {
  return setStatus(id, 'suspend');
}

export async function reactivateOrganization(id: string) {
  return setStatus(id, 'reactivate');
}
