'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@agendox/api-client';
import { serverFetch } from '@/lib/api/server';

/**
 * Registra la aceptación de los Términos y Condiciones.
 *
 * No manda la versión: la elige el backend. Si la mandara el cliente, un panel
 * viejo en caché podría dejar asentado que se aceptó un texto distinto al que se
 * mostró en pantalla.
 *
 * `revalidatePath('/', 'layout')` es lo que hace desaparecer el gate: el layout
 * vuelve a leer `/organizations/current` y ya recibe `requiresAcceptance: false`.
 */
export async function acceptTerms(): Promise<{ ok: boolean; message: string }> {
  try {
    await serverFetch('/legal/terms/acceptance', { method: 'POST' });
    revalidatePath('/', 'layout');
    return { ok: true, message: 'Términos aceptados' };
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof ApiError ? e.message : 'No se pudo registrar la aceptación',
    };
  }
}
