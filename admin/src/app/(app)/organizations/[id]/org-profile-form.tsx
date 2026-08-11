'use client';

import { useActionState, useEffect } from 'react';
import { Input, toast } from '@agendox/ui';
import { Field, SubmitButton } from '@/components/form';
import { updateOrganization, type ActionResult } from '../actions';

const IDLE: ActionResult = { ok: false, message: '' };

export function OrgProfileForm({
  id,
  name,
  timezone,
}: {
  id: string;
  name: string;
  timezone: string;
}) {
  const [state, action] = useActionState(
    updateOrganization.bind(null, id),
    IDLE,
  );

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <Field label="Nombre del negocio" htmlFor="name">
        <Input id="name" name="name" defaultValue={name} required maxLength={120} />
      </Field>
      <Field
        label="Zona horaria"
        htmlFor="timezone"
        hint="Identificador IANA, ej. America/Argentina/Buenos_Aires."
      >
        <Input id="timezone" name="timezone" defaultValue={timezone} required />
      </Field>
      {/* El slug no se edita: es la URL pública del negocio y cambiarlo rompe
          todos los links que ya circulan. */}
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
