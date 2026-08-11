'use client';

import { useActionState, useEffect } from 'react';
import { Callout, Input, toast } from '@agendox/ui';
import { Field, SubmitButton } from '@/components/form';
import { updateOwnerEmail, type ActionResult } from '../actions';

const IDLE: ActionResult = { ok: false, message: '' };

export function OwnerEmailForm({ id, ownerEmail }: { id: string; ownerEmail: string | null }) {
  const [state, action] = useActionState(updateOwnerEmail.bind(null, id), IDLE);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  if (ownerEmail === null) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta organización no tiene un usuario dueño activo.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Email del dueño"
        htmlFor="ownerEmail"
        hint="Es su usuario de acceso al panel y el email que recibe la pasarela al suscribirse."
        info="Tiene que ser único en toda la plataforma. Cambiarlo cambia también con qué email inicia sesión el dueño, así que avisale."
      >
        <Input
          id="ownerEmail"
          name="ownerEmail"
          type="email"
          defaultValue={ownerEmail}
          required
          autoComplete="off"
        />
      </Field>
      {/* Los negocios de demo se crean con emails de dominio inexistente y ahí es
          donde la suscripción falla, sin que sea evidente por qué. */}
      <Callout tone="info">
        Si el negocio no puede suscribirse, revisá esto primero: un email de dominio
        inexistente (por ejemplo <code>@demo.test</code>) es rechazado por la pasarela.
      </Callout>
      <SubmitButton>Guardar email</SubmitButton>
    </form>
  );
}
