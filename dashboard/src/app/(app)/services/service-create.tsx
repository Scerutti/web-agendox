'use client';

import { useActionState, useEffect, useRef } from 'react';
import {
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
      <CardContent>
        <form ref={ref} action={action} className="space-y-3">
          <Field label="Nombre" htmlFor="name">
            <Input id="name" name="name" required />
          </Field>
          <Field label="Descripción" htmlFor="description">
            <Textarea id="description" name="description" />
          </Field>
          <SubmitButton>Crear servicio</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
