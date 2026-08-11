'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Callout, Input, toast } from '@agendox/ui';
import { Field, SubmitButton } from '@/components/form';
import type { OrganizationBilling, PlanView } from '@/lib/api/admin.types';
import { createOrganization, type CreateResult } from '../actions';

const IDLE: CreateResult = { ok: false, message: '' };

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function formatPrice(plan: PlanView): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: plan.currency,
    maximumFractionDigits: 0,
  }).format(plan.price);
}

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

export function CreateOrgForm({ plans }: { plans: PlanView[] }) {
  const router = useRouter();
  const [state, action] = useActionState(createOrganization, IDLE);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  // El slug se propone desde el nombre pero queda editable: una vez que el
  // operador lo toca, deja de seguir al nombre.
  const [slugEdited, setSlugEdited] = useState(false);
  const [billing, setBilling] = useState<OrganizationBilling>('TRIAL');

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
        El negocio, su usuario dueño y su configuración por defecto. El dueño entra al
        panel con el email y la contraseña que pongas acá, y puede cambiarla después.
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

      <fieldset className="space-y-4 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">Cómo arranca comercialmente</legend>

        <div className="space-y-2">
          <label className="flex items-start gap-3">
            <input
              type="radio"
              name="billing"
              value="TRIAL"
              checked={billing === 'TRIAL'}
              onChange={() => setBilling('TRIAL')}
              className="mt-1 h-4 w-4 border-input"
            />
            <span>
              <span className="block text-sm font-medium">Período de prueba</span>
              <span className="block text-xs text-muted-foreground">
                30 días gratis. Al vencer, el dueño elige plan y paga por Mercado Pago.
                Es el camino normal.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="radio"
              name="billing"
              value="ACTIVE"
              checked={billing === 'ACTIVE'}
              onChange={() => setBilling('ACTIVE')}
              disabled={plans.length === 0}
              className="mt-1 h-4 w-4 border-input disabled:cursor-not-allowed"
            />
            <span>
              <span className="block text-sm font-medium">Suscripción activa</span>
              <span className="block text-xs text-muted-foreground">
                {plans.length === 0
                  ? 'No hay planes activos para otorgar.'
                  : 'Queda pago y activo sin pasar por la pasarela. Para cuentas de cortesía, internas o de QA.'}
              </span>
            </span>
          </label>
        </div>

        {billing === 'ACTIVE' ? (
          <>
            <Field label="Plan a otorgar" htmlFor="planId">
              <select id="planId" name="planId" className={selectClass} required defaultValue="">
                <option value="" disabled>
                  Elegí un plan…
                </option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · {formatPrice(plan)}
                  </option>
                ))}
              </select>
            </Field>
            {/* Es una vía para dar acceso pago sin cobrar: conviene que quien la
                usa sepa qué implica y no la elija por descarte. */}
            <Callout tone="warning" title="Estás otorgando acceso pago sin cobro">
              No se genera ningún cobro ni se avisa a Mercado Pago. La renovación no
              es automática: al terminar el período la suscripción vence y hay que
              volver a otorgarla o pasar al checkout real. Queda registrado en el log
              con tu usuario.
            </Callout>
          </>
        ) : null}
      </fieldset>

      <SubmitButton pendingLabel="Creando…">Crear negocio</SubmitButton>
    </form>
  );
}
