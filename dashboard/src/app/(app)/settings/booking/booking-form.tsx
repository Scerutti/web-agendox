'use client';

import { useActionState } from 'react';
import { Input, Textarea } from '@agendox/ui';
import { Field, CheckboxRow } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { saveBooking } from '../actions';
import type { BookingSettings } from '@/lib/api/settings';

export function BookingForm({ data }: { data: BookingSettings }) {
  const [state, action] = useActionState(saveBooking, IDLE_STATE);
  useActionFeedback(state);

  return (
    <form action={action} className="space-y-4">
      <CheckboxRow
        name="publicBookingEnabled"
        label="Reserva pública habilitada"
        defaultChecked={data.publicBookingEnabled}
        hint="Permite que los clientes reserven desde el link público."
      />
      <Field
        label="Granularidad de slots (min)"
        htmlFor="slotGranularityMinutes"
        hint="Entre 1 y 240."
      >
        <Input
          id="slotGranularityMinutes"
          name="slotGranularityMinutes"
          type="number"
          min={1}
          max={240}
          defaultValue={data.slotGranularityMinutes}
          required
        />
      </Field>
      <Field label="Antelación mínima (min)" htmlFor="minNoticeMinutes">
        <Input
          id="minNoticeMinutes"
          name="minNoticeMinutes"
          type="number"
          min={0}
          defaultValue={data.minNoticeMinutes}
          required
        />
      </Field>
      <Field label="Anticipación máxima (días)" htmlFor="maxAdvanceDays">
        <Input
          id="maxAdvanceDays"
          name="maxAdvanceDays"
          type="number"
          min={0}
          defaultValue={data.maxAdvanceDays}
          required
        />
      </Field>
      <Field label="Política de cancelación" htmlFor="cancellationPolicy">
        <Textarea
          id="cancellationPolicy"
          name="cancellationPolicy"
          defaultValue={data.cancellationPolicy ?? ''}
        />
      </Field>
      <CheckboxRow
        name="requiresManualApproval"
        label="Requiere aprobación manual"
        defaultChecked={data.requiresManualApproval}
        hint="Los turnos sin seña quedan PENDING_APPROVAL hasta que los apruebes."
      />
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
