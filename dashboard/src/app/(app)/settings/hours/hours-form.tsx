'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import {
  WeeklyIntervalsEditor,
  type WeekIntervals,
} from '@/components/schedule/weekly-intervals-editor';
import { saveHours } from '../actions';
import type { BusinessHour } from '@/lib/api/settings';

export function HoursForm({ hours }: { hours: BusinessHour[] }) {
  const [state, action] = useActionState(saveHours, IDLE_STATE);
  useActionFeedback(state);

  const initial: WeekIntervals = {};
  for (const h of hours) {
    if (h.isClosed || !h.opensAt || !h.closesAt) continue;
    (initial[h.dayOfWeek] ??= []).push({ start: h.opensAt, end: h.closesAt });
  }

  return (
    <form action={action} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Podés cargar varios intervalos por día (ej. mañana y tarde). Un día sin
        intervalos queda cerrado.
      </p>
      <WeeklyIntervalsEditor name="payload" initial={initial} emptyLabel="Cerrado" />
      <SubmitButton>Guardar horarios</SubmitButton>
    </form>
  );
}
