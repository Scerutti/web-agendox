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
import { userDisplayName, type UserView } from '@/lib/api/users.types';
import { createResource } from './actions';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function ResourceCreate({ users }: { users: UserView[] }) {
  const [state, action] = useActionState(createResource, IDLE_STATE);
  useActionFeedback(state);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === 'success') ref.current?.reset();
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo recurso</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={ref} action={action} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="name">
              <Input id="name" name="name" required />
            </Field>
            <Field
              label="Tipo"
              htmlFor="type"
              hint="persona, cancha, sala, box…"
            >
              <Input id="type" name="type" list="resource-types" required />
              <datalist id="resource-types">
                <option value="persona" />
                <option value="cancha" />
                <option value="sala" />
                <option value="box" />
                <option value="equipamiento" />
              </datalist>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Color" htmlFor="color">
              <Input id="color" name="color" type="color" defaultValue="#2563eb" />
            </Field>
            <Field label="Usuario asignado (opcional)" htmlFor="userId">
              <select id="userId" name="userId" className={selectClass} defaultValue="">
                <option value="">Sin asignar</option>
                {users
                  .filter((u) => u.status === 'ACTIVE')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {userDisplayName(u)}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
          <Field label="Descripción" htmlFor="description">
            <Textarea id="description" name="description" />
          </Field>
          <SubmitButton>Crear recurso</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
