'use client';

import { useEffect } from 'react';
import { toast } from '@agendox/ui';
import type { ActionState } from '@/lib/actions';

/** Muestra un toast cuando cambia el resultado de un Server Action. */
export function useActionFeedback(state: ActionState) {
  useEffect(() => {
    if (state.status === 'success') toast.success(state.message ?? 'Guardado');
    else if (state.status === 'error') toast.error(state.message ?? 'Error');
  }, [state]);
}
