'use client';

import { useActionState } from 'react';
import { Input } from '@agendox/ui';
import { Field, CheckboxRow } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { saveNotifications } from '../actions';
import type { NotificationSettings } from '@/lib/api/settings';

export function NotificationsForm({ data }: { data: NotificationSettings }) {
  const [state, action] = useActionState(saveNotifications, IDLE_STATE);
  useActionFeedback(state);

  return (
    <form action={action} className="space-y-4">
      <CheckboxRow
        name="emailEnabled"
        label="Email habilitado"
        defaultChecked={data.emailEnabled}
      />
      <CheckboxRow
        name="whatsappEnabled"
        label="WhatsApp habilitado"
        defaultChecked={data.whatsappEnabled}
        hint="WhatsApp está diferido en el MVP; el toggle queda para el futuro."
      />
      <CheckboxRow
        name="remindersEnabled"
        label="Recordatorios habilitados"
        defaultChecked={data.remindersEnabled}
      />
      <Field
        label="Horas antes del recordatorio"
        htmlFor="reminderHoursBefore"
        hint="Entre 0 y 168 (una semana)."
      >
        <Input
          id="reminderHoursBefore"
          name="reminderHoursBefore"
          type="number"
          min={0}
          max={168}
          defaultValue={data.reminderHoursBefore}
          required
        />
      </Field>
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
