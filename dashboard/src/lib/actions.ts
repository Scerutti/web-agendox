import { ApiError } from '@agendox/api-client';

// Resultado de un Server Action, consumido por los formularios con
// useActionState + useActionFeedback (toast).
export interface ActionState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

export const IDLE_STATE: ActionState = { status: 'idle' };

export function actionOk(message = 'Cambios guardados'): ActionState {
  return { status: 'success', message };
}

export function actionError(e: unknown): ActionState {
  if (e instanceof ApiError) {
    return { status: 'error', message: e.message };
  }
  return { status: 'error', message: 'Ocurrió un error inesperado' };
}
