'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@agendox/api-client';
import { serverFetch } from '@/lib/api/server';

/**
 * Inicia el checkout de suscripción: el backend crea la preferencia en la
 * pasarela y devuelve la URL de pago. El cliente redirige el navegador a
 * `initPoint`; la activación real ocurre luego por webhook.
 */
export async function startCheckout(
  planId: string,
): Promise<{ ok: boolean; initPoint?: string; message: string }> {
  try {
    const res = await serverFetch<{ initPoint: string }>('/subscription/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
    return { ok: true, initPoint: res.initPoint, message: 'Redirigiendo al pago…' };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof ApiError ? e.message : 'No se pudo iniciar el pago',
    };
  }
}

export async function cancelSubscription(): Promise<{ ok: boolean; message: string }> {
  try {
    await serverFetch('/subscription/cancel', { method: 'POST' });
    revalidatePath('/subscription');
    revalidatePath('/');
    return { ok: true, message: 'Suscripción cancelada' };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof ApiError ? e.message : 'No se pudo cancelar la suscripción',
    };
  }
}
