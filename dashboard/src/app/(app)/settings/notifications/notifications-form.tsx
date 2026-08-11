'use client';

import { useActionState } from 'react';
import { Input } from '@agendox/ui';
import { Field, CheckboxRow } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { saveNotifications } from '../actions';
import type { NotificationSettings } from '@/lib/api/settings';

export function NotificationsForm({
  data,
  whatsappAvailable,
}: {
  data: NotificationSettings;
  /** Lo habilita la plataforma por organización; mientras esté en false, el canal no existe. */
  whatsappAvailable: boolean;
}) {
  const [state, action] = useActionState(saveNotifications, IDLE_STATE);
  useActionFeedback(state);

  return (
    <form action={action} className="space-y-4">
      <CheckboxRow
        name="emailEnabled"
        label="Avisos por email"
        defaultChecked={data.emailEnabled}
        hint="Confirmaciones, cancelaciones y pedidos de seña al cliente."
      />
      <CheckboxRow
        name="remindersEnabled"
        label="Recordatorios antes del turno"
        defaultChecked={data.remindersEnabled}
        hint="Un aviso al cliente unas horas antes, para bajar los ausentes."
      />
      <Field
        label="Cuántas horas antes se envía el recordatorio"
        htmlFor="reminderHoursBefore"
        hint="Entre 0 y 168 horas (una semana)."
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

      {/* WhatsApp va último y apagado: el canal todavía no existe. Se muestra
          igual, y no oculto, para que se sepa que está en camino. */}
      <CheckboxRow
        name="whatsappEnabled"
        label="Avisos por WhatsApp"
        defaultChecked={data.whatsappEnabled}
        disabled={!whatsappAvailable}
        info={
          whatsappAvailable
            ? 'El canal de WhatsApp está habilitado para tu cuenta.'
            : 'Próximamente. Estamos integrando WhatsApp; cuando esté disponible se activa desde acá y te avisamos. Por ahora los avisos salen por email.'
        }
        hint={
          whatsappAvailable ? undefined : 'Próximamente — todavía no está disponible.'
        }
      />

      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
