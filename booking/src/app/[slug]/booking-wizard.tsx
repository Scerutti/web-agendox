'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  OtpInput,
  buttonVariants,
  toast,
} from '@agendox/ui';
import { formatMoney, formatInOrgTz, formatTimeInOrgTz } from '@agendox/domain';
import { Field } from '@/components/form/field';
import { APPOINTMENT_STATUS_UI } from '@/lib/appointment-ui';
import { book, fetchAvailability, fetchResources, saveProfile } from './actions';
import type {
  AvailabilitySlot,
  PublicResource,
  PublicService,
  PublicServiceOption,
} from '@/lib/api/public';
import type { CustomerAppointment } from '@/lib/api/customer';

type Step = 'select' | 'auth' | 'profile' | 'confirm' | 'done';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * Espera antes de habilitar cada reenvío, en segundos. Espeja la escala del
 * backend (`RESEND_DELAYS_SECONDS` en request-customer-otp.use-case.ts), que es
 * quien realmente decide: acá es solo para mostrar la cuenta regresiva sin
 * tener que pedir permiso al servidor y comerse un error.
 */
const RESEND_DELAYS_SECONDS = [30, 60, 90, 120, 150];
const MAX_RESENDS = RESEND_DELAYS_SECONDS.length;

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function BookingWizard({
  slug,
  timezone,
  services,
}: {
  slug: string;
  timezone: string;
  services: PublicService[];
}) {
  const [step, setStep] = useState<Step>('select');
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

  // Auth
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');
  /** Envíos hechos para el email actual (el inicial cuenta como 0 reenvíos). */
  const [resendCount, setResendCount] = useState(0);
  /** Momento (epoch ms) a partir del cual se puede volver a pedir un código. */
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendBlocked, setResendBlocked] = useState(false);

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

  // Cuenta regresiva del reenvío. Solo vive mientras hay espera pendiente: no
  // deja un intervalo corriendo durante el resto de la reserva.
  useEffect(() => {
    if (!cooldownUntil) return;
    function tick() {
      const left = Math.ceil((cooldownUntil - Date.now()) / 1000);
      setSecondsLeft(left > 0 ? left : 0);
      if (left <= 0) setCooldownUntil(0);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  /**
   * Devuelve el paso de identificación a cero. Sin esto, quien se equivoca de
   * email queda encerrado: el input se deshabilita al enviar y el contador
   * seguiría corriendo contra una dirección que no es la suya.
   */
  function resetOtpFlow() {
    setOtpSent(false);
    setCode('');
    setResendCount(0);
    setCooldownUntil(0);
    setSecondsLeft(0);
    setResendBlocked(false);
  }

  async function sendOtp() {
    if (!email) {
      toast.error('Ingresá tu email');
      return;
    }
    setBusy(true);
    const r = await fetch(`/api/portal/${slug}/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await r.json().catch(() => ({}));
    setBusy(false);

    // El servidor es el que manda. Si corta con 429 se adopta su espera: eso es
    // lo que cubre al que recarga la página para saltear el contador local.
    if (r.status === 429) {
      const retry =
        Number(data?.details?.retryAfterSeconds) || RESEND_DELAYS_SECONDS[0]!;
      setOtpSent(true);
      setCooldownUntil(Date.now() + retry * 1000);
      if (resendCount >= MAX_RESENDS) setResendBlocked(true);
      toast.error(data.message || 'Esperá unos segundos antes de pedir otro código');
      return;
    }

    if (!r.ok) {
      toast.error('No se pudo enviar el código');
      return;
    }

    // El envío inicial no cuenta como reenvío, pero sí arranca la espera: si no,
    // el botón queda disponible al instante y se puede golpear en loop.
    const nextCount = otpSent ? resendCount + 1 : resendCount;
    const wait = RESEND_DELAYS_SECONDS[nextCount] ?? RESEND_DELAYS_SECONDS.at(-1)!;
    setResendCount(nextCount);
    setOtpSent(true);
    setCooldownUntil(Date.now() + wait * 1000);
    if (nextCount >= MAX_RESENDS) setResendBlocked(true);
    toast.success('Te enviamos un código', {
      description: 'Si no lo ves en la bandeja de entrada, revisá la carpeta de spam.',
    });
  }

  /**
   * `submittedCode` llega cuando el disparo viene de completar la última casilla:
   * en ese momento el estado `code` del padre todavía no se actualizó, así que hay
   * que usar el valor que manda el input y no el de la clausura.
   */
  async function verifyOtp(submittedCode?: string) {
    const value = submittedCode ?? code;
    if (value.length < 6) {
      toast.error('Ingresá los 6 dígitos del código');
      return;
    }
    setBusy(true);
    const r = await fetch(`/api/portal/${slug}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: value }),
    });
    const data = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      toast.error(data.message || 'Código inválido');
      return;
    }
    setStep(data.profileComplete ? 'confirm' : 'profile');
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
    if (res.ok) setStep('confirm');
    else toast.error(res.message);
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

            <Button
              className="w-full"
              disabled={!slot}
              onClick={() => setStep('auth')}
            >
              Continuar
            </Button>
          </>
        )}

        {step === 'auth' && (
          <>
            <p className="text-sm text-muted-foreground">
              Te identificamos por email con un código de un solo uso.
            </p>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
              />
            </Field>
            {!otpSent ? (
              <>
                <Button onClick={sendOtp} disabled={busy} className="w-full">
                  {busy ? 'Enviando…' : 'Enviar código'}
                </Button>
                <BackButton onClick={() => setStep('select')} />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Código de 6 dígitos</p>
                  <OtpInput
                    name="code"
                    autoFocus
                    autoSubmit={false}
                    disabled={busy}
                    onChange={setCode}
                    onComplete={verifyOtp}
                  />
                  {/* El código llega por email y ahí es donde se cae: si no está
                      en la bandeja, casi siempre está en spam. Decirlo acá evita
                      el reenvío en loop y el abandono de la reserva. */}
                  <p className="text-xs text-muted-foreground">
                    Te lo enviamos a <span className="font-medium">{email}</span>. Si no lo
                    ves en unos segundos, <strong>revisá la carpeta de spam</strong> o
                    correo no deseado.
                  </p>
                  <button
                    type="button"
                    onClick={resetOtpFlow}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Usar otro email
                  </button>
                </div>

                <Button
                  onClick={() => verifyOtp()}
                  disabled={busy || code.length < 6}
                  className="w-full"
                >
                  {busy ? 'Verificando…' : 'Verificar'}
                </Button>

                {/* Las dos acciones secundarias van separadas y a los extremos:
                    juntas se tocaba la equivocada, sobre todo en mobile. */}
                <div className="flex items-center justify-between gap-4 border-t pt-4">
                  <BackButton onClick={() => setStep('select')} />
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline disabled:no-underline disabled:opacity-50"
                    onClick={sendOtp}
                    disabled={busy || resendBlocked || secondsLeft > 0}
                  >
                    {resendBlocked
                      ? 'Límite alcanzado'
                      : secondsLeft > 0
                        ? `Reenviar en ${formatCountdown(secondsLeft)}`
                        : 'Reenviar código'}
                  </button>
                </div>

                {resendBlocked ? (
                  <p className="text-xs text-destructive">
                    Alcanzaste el límite de reenvíos. Esperá unos minutos y volvé a
                    intentar, o comunicate con el negocio para reservar por otra vía.
                  </p>
                ) : null}
              </>
            )}
          </>
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
