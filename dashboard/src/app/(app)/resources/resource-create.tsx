'use client';

import { useActionState, useEffect, useRef } from 'react';
import {
  Callout,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ColorPicker,
  Input,
  Textarea,
} from '@agendox/ui';
import { Field } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { userDisplayName, type UserView } from '@/lib/api/users.types';
import { createResource } from './actions';

// `min-w-0`: el ancho mínimo de un `<select>` es el de su opción más larga
// (un nombre de usuario, un email), y dentro de una grilla eso estira la
// columna y con ella la página. Con esto el select se recorta al ancho real.
const selectClass =
  'flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

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
      <CardContent className="space-y-4">
        <form ref={ref} action={action} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Nombre"
              htmlFor="name"
              hint="Como lo va a ver el cliente al elegir. Ej: “Martín”, “Cancha 1”."
            >
              <Input id="name" name="name" required />
            </Field>
            <Field
              label="Tipo"
              htmlFor="type"
              hint="Elegí uno de la lista o escribí el tuyo."
              info={
                <>
                  Es una etiqueta libre para agrupar y ordenar tus recursos —{' '}
                  <em>persona</em>, <em>cancha</em>, <em>sala</em>, <em>box</em>,{' '}
                  <em>equipamiento</em>. No cambia cómo funcionan los turnos: dos recursos
                  de tipos distintos se reservan igual. Sirve para que la lista se lea
                  cuando tenés muchos.
                </>
              }
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
            <Field
              label="Color"
              htmlFor="color"
              hint="Para distinguirlo de un vistazo en el calendario."
            >
              <ColorPicker id="color" name="color" defaultValue="#2563eb" clearable={false} />
            </Field>
            <Field
              label="Usuario asignado (opcional)"
              htmlFor="userId"
              info="Vinculá el recurso con la cuenta de la persona que atiende, para que vea sus propios turnos al entrar al panel. Dejalo sin asignar si el recurso no es una persona con usuario (una cancha, una sala)."
            >
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
          <Field
            label="Descripción"
            htmlFor="description"
            hint="Opcional, para uso interno."
          >
            <Textarea id="description" name="description" />
          </Field>
          <SubmitButton>Crear recurso</SubmitButton>
        </form>

        {/* Crear el recurso no alcanza para que aparezca en la página pública:
            estos dos pasos son los que más se olvidan. */}
        <Callout tone="tip" title="Después de crearlo faltan dos pasos">
          Entrá a <strong>Gestionar</strong> en el recurso y definí: qué{' '}
          <strong>servicios</strong> ofrece y su <strong>horario de atención</strong>. Sin
          eso el recurso existe pero no se le pueden reservar turnos.
        </Callout>
      </CardContent>
    </Card>
  );
}
