'use server';

import { serverFetch } from '@/lib/api/server';
import { actionError, actionOk, type ActionState } from '@/lib/actions';

/**
 * Cambio de la propia contraseña. Al guardarla el backend revoca los refresh
 * tokens, así que las demás sesiones abiertas se caen en cuanto vence su access
 * token — la de esta pestaña sigue viva hasta entonces.
 */
export async function changePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentPassword = String(formData.get('currentPassword') ?? '');
  const newPassword = String(formData.get('newPassword') ?? '');
  const repeatPassword = String(formData.get('repeatPassword') ?? '');

  // Se validan acá las dos reglas que el backend no puede chequear (la
  // repetición) o que conviene atajar antes de gastar un request.
  if (newPassword.length < 10) {
    return { status: 'error', message: 'La contraseña nueva necesita al menos 10 caracteres' };
  }
  if (newPassword !== repeatPassword) {
    return { status: 'error', message: 'Las contraseñas nuevas no coinciden' };
  }

  try {
    await serverFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return actionOk('Contraseña actualizada');
  } catch (e) {
    return actionError(e);
  }
}
