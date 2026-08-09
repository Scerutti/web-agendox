'use client';

import { useActionState } from 'react';
import { Input } from '@agendox/ui';
import { Field } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { saveBusiness } from '../actions';
import type { BusinessSettings } from '@/lib/api/settings';

export function BusinessForm({ data }: { data: BusinessSettings }) {
  const [state, action] = useActionState(saveBusiness, IDLE_STATE);
  useActionFeedback(state);

  return (
    <form action={action} className="space-y-4">
      <Field label="Nombre del negocio" htmlFor="businessName">
        <Input
          id="businessName"
          name="businessName"
          defaultValue={data.businessName}
          required
        />
      </Field>
      <Field
        label="Zona horaria"
        htmlFor="timezone"
        hint="IANA, ej. America/Argentina/Buenos_Aires"
      >
        <Input id="timezone" name="timezone" defaultValue={data.timezone} required />
      </Field>
      <Field label="Email de contacto" htmlFor="contactEmail">
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          defaultValue={data.contactEmail ?? ''}
        />
      </Field>
      <Field label="Teléfono de contacto" htmlFor="contactPhone">
        <Input
          id="contactPhone"
          name="contactPhone"
          defaultValue={data.contactPhone ?? ''}
        />
      </Field>
      <Field label="Dirección" htmlFor="address">
        <Input id="address" name="address" defaultValue={data.address ?? ''} />
      </Field>
      <Field label="Locale" htmlFor="locale" hint="ej. es-AR">
        <Input id="locale" name="locale" defaultValue={data.locale ?? ''} />
      </Field>
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
