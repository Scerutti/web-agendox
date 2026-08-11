'use client';

import { useActionState, useEffect, useRef } from 'react';
import {
  Callout,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from '@agendox/ui';
import { Field } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { createService } from './actions';

export function ServiceCreate() {
  const [state, action] = useActionState(createService, IDLE_STATE);
  useActionFeedback(state);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success') ref.current?.reset();
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo servicio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form ref={ref} action={action} className="space-y-3">
          <Field
            label="Nombre"
            htmlFor="name"
            hint="Lo que el cliente elige al reservar. Ej: “Corte de pelo”, “Alquiler de cancha”."
          >
            <Input id="name" name="name" required />
          </Field>
          <Field
            label="Descripción"
            htmlFor="description"
            hint="Opcional. Se muestra al cliente debajo del nombre."
          >
            <Textarea id="description" name="description" />
          </Field>
          <SubmitButton>Crear servicio</SubmitButton>
        </form>

        {/* La duración y el precio no están acá a propósito: viven en las
            opciones, porque un mismo servicio suele tener varias variantes. */}
        <Callout tone="tip" title="Después de crearlo faltan dos pasos">
          Entrá a <strong>Gestionar</strong> y agregá al menos una <strong>opción</strong>{' '}
          con su duración y precio. Después, en <strong>Recursos</strong>, marcá quién
          presta el servicio. Recién entonces se puede reservar.
        </Callout>
      </CardContent>
    </Card>
  );
}
