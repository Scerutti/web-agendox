'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@agendox/api-client';
import { serverFetch } from '@/lib/api/server';

async function depositAction(
  id: string,
  op: 'confirm' | 'reject',
): Promise<{ ok: boolean; message: string }> {
  try {
    await serverFetch(`/deposits/${id}/${op}`, { method: 'POST' });
    revalidatePath('/deposits');
    revalidatePath('/calendar');
    return {
      ok: true,
      message: op === 'confirm' ? 'Seña confirmada' : 'Seña rechazada',
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof ApiError ? e.message : 'No se pudo procesar la seña',
    };
  }
}

// Todo export de un archivo `'use server'` debe ser `async`.
export async function confirmDeposit(id: string) {
  return depositAction(id, 'confirm');
}

export async function rejectDeposit(id: string) {
  return depositAction(id, 'reject');
}
