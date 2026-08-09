'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Input, Textarea } from '@agendox/ui';
import { Field } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { createClient, updateClient } from './actions';
import type { ClientView } from '@/lib/api/clients';

export function ClientForm({
  mode,
  client,
  onSuccess,
}: {
  mode: 'create' | 'edit';
  client?: ClientView;
  onSuccess?: () => void;
}) {
  const [state, action] = useActionState(
    mode === 'create' ? createClient : updateClient,
    IDLE_STATE,
  );
  useActionFeedback(state);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success') {
      onSuccess?.();
      if (mode === 'create') formRef.current?.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      {mode === 'edit' && (
        <input type="hidden" name="id" defaultValue={client!.id} />
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="firstName">
          <Input
            id="firstName"
            name="firstName"
            defaultValue={client?.firstName ?? ''}
            required
          />
        </Field>
        <Field label="Apellido" htmlFor="lastName">
          <Input
            id="lastName"
            name="lastName"
            defaultValue={client?.lastName ?? ''}
            required
          />
        </Field>
      </div>
      {mode === 'create' && (
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required />
        </Field>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="WhatsApp" htmlFor="whatsapp">
          <Input
            id="whatsapp"
            name="whatsapp"
            defaultValue={client?.whatsapp ?? ''}
            required
          />
        </Field>
        <Field label="Teléfono" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={client?.phone ?? ''} />
        </Field>
      </div>
      <Field label="Notas" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={client?.notes ?? ''} />
      </Field>
      <SubmitButton>
        {mode === 'create' ? 'Crear cliente' : 'Guardar'}
      </SubmitButton>
    </form>
  );
}
