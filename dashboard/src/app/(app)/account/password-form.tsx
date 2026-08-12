'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Input } from '@agendox/ui';
import { Field } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { changePassword } from './actions';

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, IDLE_STATE);
  useActionFeedback(state);
  const formRef = useRef<HTMLFormElement>(null);

  // Las contraseñas no se dejan escritas en pantalla después de guardar.
  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="max-w-md space-y-4">
      <Field label="Contraseña actual" htmlFor="currentPassword">
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field
        label="Contraseña nueva"
        htmlFor="newPassword"
        hint="Al menos 10 caracteres."
      >
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </Field>
      <Field label="Repetir contraseña nueva" htmlFor="repeatPassword">
        <Input
          id="repeatPassword"
          name="repeatPassword"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </Field>
      <SubmitButton>Cambiar contraseña</SubmitButton>
    </form>
  );
}
