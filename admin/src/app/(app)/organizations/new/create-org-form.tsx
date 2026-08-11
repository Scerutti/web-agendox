'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Callout, Input, toast } from '@agendox/ui';
import { Field, SubmitButton } from '@/components/form';
import { createOrganization, type CreateResult } from '../actions';

const IDLE: CreateResult = { ok: false, message: '' };

/** Convierte "Barbería Central" en "barberia-central". */
function slugify(value: string): string {
  return value
    .normalize('NFD')
    // Saca los diacríticos que NFD separó (la tilde de "Barbería").
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

export function CreateOrgForm() {
  const router = useRouter();
  const [state, action] = useActionState(createOrganization, IDLE);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  // El slug se propone desde el nombre pero queda editable: una vez que el
  // operador lo toca, deja de seguir al nombre.
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      if (state.id) router.push(`/organizations/${state.id}`);
    } else {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-5">
      <Callout tone="info" title="Qué crea esta alta">
        El negocio, su usuario dueño y un período de prueba de 30 días. El dueño entra
        al panel con el email y la contraseña que pongas acá, y puede cambiarla después.
      </Callout>

      <Field label="Nombre del negocio" htmlFor="organizationName">
        <Input
          id="organizationName"
          name="organizationName"
          required
          maxLength={120}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
        />
      </Field>

      <Field
        label="Slug público"
        htmlFor="slug"
        hint={slug ? `La página pública va a ser /${slug}` : 'Se propone solo desde el nombre.'}
        info="Es la parte de la URL que identifica al negocio en la app de reservas. Único en toda la plataforma, en minúsculas y con guiones."
      >
        <Input
          id="slug"
          name="slug"
          required
          maxLength={63}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          value={slug}
          onChange={(e) => {
            setSlugEdited(true);
            setSlug(e.target.value);
          }}
        />
      </Field>

      <Field
        label="Zona horaria"
        htmlFor="timezone"
        hint="Identificador IANA. Define cómo se interpretan los horarios del negocio."
      >
        <Input
          id="timezone"
          name="timezone"
          required
          defaultValue="America/Argentina/Buenos_Aires"
        />
      </Field>

      <fieldset className="space-y-4 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">Usuario dueño</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" htmlFor="ownerFirstName">
            <Input id="ownerFirstName" name="ownerFirstName" required maxLength={80} />
          </Field>
          <Field label="Apellido" htmlFor="ownerLastName">
            <Input id="ownerLastName" name="ownerLastName" required maxLength={80} />
          </Field>
        </div>
        <Field
          label="Email"
          htmlFor="ownerEmail"
          hint="Tiene que ser un email real: es con el que entra y el que usa la pasarela de pago al suscribirse."
        >
          <Input id="ownerEmail" name="ownerEmail" type="email" required autoComplete="off" />
        </Field>
        <Field label="Contraseña inicial" htmlFor="ownerPassword" hint="Mínimo 10 caracteres.">
          <Input
            id="ownerPassword"
            name="ownerPassword"
            type="password"
            required
            minLength={10}
            maxLength={72}
            autoComplete="new-password"
          />
        </Field>
      </fieldset>

      <SubmitButton pendingLabel="Creando…">Crear negocio</SubmitButton>
    </form>
  );
}
