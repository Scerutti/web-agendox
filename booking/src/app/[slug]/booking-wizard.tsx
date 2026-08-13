'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  buttonVariants,
  toast,
} from '@agendox/ui';
import { formatMoney, formatInOrgTz, formatTimeInOrgTz } from '@agendox/domain';
import { CustomerAuth } from '@/components/customer-auth';
import { Field } from '@/components/form/field';
import { APPOINTMENT_STATUS_UI } from '@/lib/appointment-ui';
import { book, fetchAvailability, fetchResources, saveProfile } from './actions';
import type {
  AvailabilitySlot,
  PublicResource,
  PublicService,
  PublicServiceOption,
} from '@/lib/api/public';
import type { CustomerAppointment, CustomerSession } from '@/lib/api/customer';

type Step = 'select' | 'auth' | 'profile' | 'confirm' | 'done';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function BookingWizard({
  slug,
  timezone,
  services,
  session,
}: {
  slug: string;
  timezone: string;
  services: PublicService[];
  /** Identificación resuelta en el servidor: define si hay que pedir el código. */
  session: CustomerSession;
}) {
  const [step, setStep] = useState<Step>('select');
  /**
   * Se arranca con lo que dijo el servidor, pero es estado del cliente porque
   * cambia sin recargar: al validar un código acá mismo, o al soltar la sesión
   * con "No soy yo".
   */
  const [identifiedAs, setIdentifiedAs] = useState<string | null>(
    session.authenticated ? session.email : null,
  );
  const [authenticated, setAuthenticated] = useState(session.authenticated);
  // También es estado: si completa el perfil en esta visita, volver a "Continuar"
  // no lo tiene que mandar de nuevo a llenar el formulario.
  const [profileComplete, setProfileComplete] = useState(session.profileComplete);
  const [busy, setBusy] = useState(false);
  // Idempotency key estable por intento de reserva (mismo key en reintentos por
  // doble-submit → el backend deduplica). Se regenera si un 409 vuelve a selección.
  const idempotencyKeyRef = useRef<string | null>(null);

  // Selección
  const [serviceId, setServiceId] = useState('');
  const [optionId, setOptionId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [resources, setResources] = useState<PublicResource[]>([]);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);

  // La identificación (email + código) vive en `CustomerAuth`: la comparte con
  // la página de inicio de sesión del portal.

  // Profile
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    whatsapp: '',
    phone: '',
  });

  // Resultado
  const [result, setResult] = useState<CustomerAppointment | null>(null);

  const service = services.find((s) => s.id === serviceId);
  const options: PublicServiceOption[] = service?.options ?? [];
  const option = options.find((o) => o.id === optionId);

  async function onServiceChange(id: string) {
    setServiceId(id);
    setOptionId('');
    setResourceId('');
    setSlots(null);
    setSlot(null);
    setResources([]);
    if (!id) return;
    try {
      setResources(await fetchResources(slug, id));
    } catch {
      toast.error('No se pudieron cargar los recursos');
    }
  }

  async function search() {
    if (!serviceId || !optionId || !date) {
      toast.error('Elegí servicio, opción y fecha');
      return;
    }
    setBusy(true);
    setSlot(null);
    const res = await fetchAvailability(slug, {
      serviceId,
      serviceOptionId: optionId,
      resourceId: resourceId || undefined,
      fromDate: date,
      toDate: date,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.message);
      setSlots([]);
      return;
    }
    setSlots(res.result.slots);
  }

  /**
   * Suelta la sesión y vuelve a pedir el código.
   *
   * Es la contracara obligatoria de saltear la identificación: sin esto, en un
   * teléfono prestado —o cuando alguien reserva para otra persona— la reserva se
   * haría en silencio a nombre de quien entró antes, y recién se descubre cuando
   * el turno le aparece al que no era.
   */
  async function switchIdentity() {
    setBusy(true);
    await fetch(`/api/portal/${slug}/logout`, { method: 'POST' }).catch(() => null);
    setBusy(false);
    setAuthenticated(false);
    setIdentifiedAs(null);
    setStep('auth');
  }

  async function submitProfile() {
    if (!profile.firstName || !profile.lastName || !profile.whatsapp) {
      toast.error('Completá nombre, apellido y WhatsApp');
      return;
    }
    setBusy(true);
    const res = await saveProfile(slug, {
      firstName: profile.firstName,
      lastName: profile.lastName,
      whatsapp: profile.whatsapp,
      phone: profile.phone || undefined,
    });
    setBusy(false);
    if (res.ok) {
      setProfileComplete(true);
      setStep('confirm');
    } else toast.error(res.message);
  }

  async function confirmBooking() {
    if (!slot) return;
    if (!idempotencyKeyRef.current) idempotencyKeyRef.current = crypto.randomUUID();
    setBusy(true);
    const res = await book(slug, {
      serviceId,
      serviceOptionId: optionId,
      resourceId: slot.resourceId,
      startsAt: slot.start,
      idempotencyKey: idempotencyKeyRef.current,
    });
    setBusy(false);
    if (res.ok) {
      setResult(res.appointment);
      setStep('done');
      return;
    }
    if (res.conflict) {
      toast.error('Ese horario se ocupó. Elegí otro.');
      idempotencyKeyRef.current = null;
      setSlot(null);
      setSlots(null);
      setStep('select');
      return;
    }
    toast.error(res.message);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {stepTitle(step)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'select' && (
          <>
            <Field label="Servicio" htmlFor="service">
              <select
                id="service"
                className={selectClass}
                value={serviceId}
                onChange={(e) => onServiceChange(e.target.value)}
              >
                <option value="">Elegí un servicio…</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Opción" htmlFor="option">
                <select
                  id="option"
                  className={selectClass}
                  value={optionId}
                  onChange={(e) => {
                    setOptionId(e.target.value);
                    setSlots(null);
                    setSlot(null);
                  }}
                  disabled={!options.length}
                >
                  <option value="">Opción…</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} — {o.durationMinutes} min · {formatMoney(o.price)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Profesional / recurso" htmlFor="resource">
                <select
                  id="resource"
                  className={selectClass}
                  value={resourceId}
                  onChange={(e) => {
                    setResourceId(e.target.value);
                    setSlots(null);
                    setSlot(null);
                  }}
                >
                  <option value="">Cualquiera</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Fecha" htmlFor="date">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSlots(null);
                  setSlot(null);
                }}
              />
            </Field>
            <Button variant="outline" onClick={search} disabled={busy}>
              {busy ? 'Buscando…' : 'Ver horarios'}
            </Button>

            {slots !== null && (
              <div className="rounded-md border p-3">
                {slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sin horarios para ese día.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => {
                      const sel =
                        slot?.start === s.start && slot?.resourceId === s.resourceId;
                      return (
                        <button
                          key={`${s.resourceId}-${s.start}`}
                          type="button"
                          onClick={() => setSlot(s)}
                          className={
                            'rounded-md border px-3 py-1.5 text-sm ' +
                            (sel
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'hover:bg-accent')
                          }
                        >
                          {formatTimeInOrgTz(s.start, timezone)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Con la sesión viva no se vuelve a pedir el código: se salta
                derecho a confirmar, o al perfil si nunca lo completó. */}
            <Button
              className="w-full"
              disabled={!slot}
              onClick={() =>
                setStep(!authenticated ? 'auth' : profileComplete ? 'confirm' : 'profile')
              }
            >
              Continuar
            </Button>
          </>
        )}

        {step === 'auth' && (
          <CustomerAuth
            slug={slug}
            intro="Te identificamos por email con un código de un solo uso."
            back={<BackButton onClick={() => setStep('select')} />}
            onAuthenticated={(result) => {
              setAuthenticated(true);
              setIdentifiedAs(result.email);
              setProfileComplete(result.profileComplete);
              setStep(result.profileComplete ? 'confirm' : 'profile');
            }}
          />
        )}

        {step === 'profile' && (
          <>
            <p className="text-sm text-muted-foreground">
              Completá tus datos para confirmar la reserva.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nombre" htmlFor="firstName">
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile({ ...profile, firstName: e.target.value })
                  }
                />
              </Field>
              <Field label="Apellido" htmlFor="lastName">
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile({ ...profile, lastName: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="WhatsApp" htmlFor="whatsapp">
              <Input
                id="whatsapp"
                value={profile.whatsapp}
                onChange={(e) =>
                  setProfile({ ...profile, whatsapp: e.target.value })
                }
              />
            </Field>
            <Field label="Teléfono (opcional)" htmlFor="phone">
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </Field>
            <Button onClick={submitProfile} disabled={busy} className="w-full">
              {busy ? 'Guardando…' : 'Continuar'}
            </Button>
          </>
        )}

        {step === 'confirm' && (
          <>
            {/* Quién va a quedar como titular del turno. Va antes del resumen y
                no escondido al pie: si el teléfono es prestado, este es el
                momento de darse cuenta, no cuando el turno le llega a otro. */}
            {identifiedAs ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 p-3 text-sm">
                <span className="min-w-0 break-all">
                  <span className="text-muted-foreground">Reservás como </span>
                  <span className="font-medium">{identifiedAs}</span>
                </span>
                <button
                  type="button"
                  onClick={switchIdentity}
                  disabled={busy}
                  className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                >
                  No soy yo
                </button>
              </div>
            ) : null}
            <div className="space-y-1 rounded-md border p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Servicio: </span>
                {service?.name}
              </p>
              <p>
                <span className="text-muted-foreground">Opción: </span>
                {option
                  ? `${option.name} — ${option.durationMinutes} min · ${formatMoney(option.price)}`
                  : '—'}
              </p>
              <p>
                <span className="text-muted-foreground">Cuándo: </span>
                {slot ? formatInOrgTz(slot.start, timezone) : '—'}
              </p>
            </div>
            {/* Aceptación por acción afirmativa: confirmar la reserva es el
                acto de aceptación, y el aviso está inmediatamente antes del
                botón. No se usa un checkbox obligatorio a propósito: sumaría un
                paso a un flujo de conversión sin agregar validez, porque el
                servicio que se contrata es el turno con el negocio, no con la
                plataforma. */}
            <p className="text-xs leading-relaxed text-muted-foreground">
              Al confirmar aceptás los{' '}
              <Link
                href="/legal/terms"
                target="_blank"
                className="underline underline-offset-4"
              >
                Términos y Condiciones
              </Link>{' '}
              y la{' '}
              <Link
                href="/legal/privacy"
                target="_blank"
                className="underline underline-offset-4"
              >
                Política de Privacidad
              </Link>
              , y que el negocio use tus datos para gestionar este turno. Si el turno
              requiere una seña, se abona <strong className="font-medium">directamente al
              negocio</strong>: Agendox no recibe ni administra ese dinero, y la política de
              cancelación y devolución la define el negocio.
            </p>
            <Button onClick={confirmBooking} disabled={busy} className="w-full">
              {busy ? 'Reservando…' : 'Confirmar reserva'}
            </Button>
            <BackButton onClick={() => setStep('select')} />
          </>
        )}

        {step === 'done' && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="success">Reserva creada</Badge>
            </div>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Turno: </span>
                {result.serviceName} · {formatInOrgTz(result.startsAt, timezone)}
              </p>
              <p>
                <span className="text-muted-foreground">Estado: </span>
                {APPOINTMENT_STATUS_UI[result.status].label}
              </p>
            </div>
            {result.transfer && (
              <div className="space-y-1 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                <p className="font-medium">Datos para la seña</p>
                <p>Seña: {formatMoney(result.transfer.depositAmount)}</p>
                {result.transfer.bankName && <p>Banco: {result.transfer.bankName}</p>}
                {result.transfer.accountHolder && (
                  <p>Titular: {result.transfer.accountHolder}</p>
                )}
                {result.transfer.alias && <p>Alias: {result.transfer.alias}</p>}
                {result.transfer.cbu && <p>CBU: {result.transfer.cbu}</p>}
                {result.transfer.instructions && (
                  <p className="text-muted-foreground">
                    {result.transfer.instructions}
                  </p>
                )}
              </div>
            )}
            <Link
              href={`/${slug}/portal`}
              className={buttonVariants({ variant: 'default' }) + ' w-full'}
            >
              Ver mis turnos
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-muted-foreground hover:underline"
    >
      ← Volver a elegir horario
    </button>
  );
}

function stepTitle(step: Step): string {
  switch (step) {
    case 'select':
      return '1. Elegí servicio y horario';
    case 'auth':
      return '2. Identificate';
    case 'profile':
      return '3. Tus datos';
    case 'confirm':
      return 'Confirmá tu reserva';
    case 'done':
      return 'Listo';
  }
}
