'use client';

import { useActionState } from 'react';
import Link from 'next/link';
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
        hint="Permite que los clientes reserven desde el link público. Si lo apagás, solo el staff puede cargar turnos."
      />
      <Field
        label="Cada cuántos minutos empieza un turno"
        htmlFor="slotGranularityMinutes"
        hint="Con 30, los horarios ofrecidos son 9:00, 9:30, 10:00… Entre 1 y 240 minutos."
        info={
          <>
            Define la grilla de horarios que ve el cliente al reservar, no cuánto dura
            el turno (eso lo define cada servicio). Un valor chico ofrece más horarios
            y aprovecha mejor la agenda; uno grande la deja más ordenada.
          </>
        }
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
      <Field
        label="Antelación mínima para reservar (min)"
        htmlFor="minNoticeMinutes"
        hint="Con 120, nadie puede reservar para dentro de las próximas 2 horas."
      >
        <Input
          id="minNoticeMinutes"
          name="minNoticeMinutes"
          type="number"
          min={0}
          defaultValue={data.minNoticeMinutes}
          required
        />
      </Field>
      <Field
        label="Hasta cuántos días adelante se puede reservar"
        htmlFor="maxAdvanceDays"
        hint="Con 60, la agenda pública llega hasta dos meses adelante."
      >
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
        label="Aprobar los turnos a mano antes de confirmarlos"
        defaultChecked={data.requiresManualApproval}
        hint={
          <>
            Los turnos sin seña quedan en estado <strong>Por aprobar</strong> y no se
            confirman hasta que los aceptes. Los aprobás o rechazás desde{' '}
            <Link href="/calendar" className="font-medium text-primary hover:underline">
              Calendario
            </Link>
            , abriendo el turno.
          </>
        }
      />
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
