'use client';

import { useActionState } from 'react';
import { Input, Textarea } from '@agendox/ui';
import { Field } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { saveBranding } from '../actions';
import type { BrandingSettings } from '@/lib/api/settings';

export function BrandingForm({ data }: { data: BrandingSettings }) {
  const [state, action] = useActionState(saveBranding, IDLE_STATE);
  useActionFeedback(state);

  return (
    <form action={action} className="space-y-4">
      <Field label="Logo (URL)" htmlFor="logoUrl">
        <Input id="logoUrl" name="logoUrl" defaultValue={data.logoUrl ?? ''} />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Color primario" htmlFor="primaryColor" hint="ej. #2563eb">
          <Input
            id="primaryColor"
            name="primaryColor"
            defaultValue={data.primaryColor ?? ''}
          />
        </Field>
        <Field label="Color secundario" htmlFor="secondaryColor">
          <Input
            id="secondaryColor"
            name="secondaryColor"
            defaultValue={data.secondaryColor ?? ''}
          />
        </Field>
      </div>
      <Field label="Título público" htmlFor="publicTitle">
        <Input
          id="publicTitle"
          name="publicTitle"
          defaultValue={data.publicTitle ?? ''}
        />
      </Field>
      <Field label="Descripción pública" htmlFor="publicDescription">
        <Textarea
          id="publicDescription"
          name="publicDescription"
          defaultValue={data.publicDescription ?? ''}
        />
      </Field>
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
