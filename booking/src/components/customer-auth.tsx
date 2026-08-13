'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Button, Input, OtpInput, toast } from '@agendox/ui';
import { Field } from '@/components/form/field';

/**
 * Espera antes de habilitar cada reenvío, en segundos. Espeja la escala del
 * backend (`RESEND_DELAYS_SECONDS` en request-customer-otp.use-case.ts), que es
 * quien realmente decide: acá es solo para mostrar la cuenta regresiva sin
 * tener que pedir permiso al servidor y comerse un error.
 */
const RESEND_DELAYS_SECONDS = [30, 60, 90, 120, 150];
const MAX_RESENDS = RESEND_DELAYS_SECONDS.length;

/**
 * Cuánto vive el código, en milisegundos. Espeja `OTP_TTL_MINUTES` del backend:
 * pasado ese tiempo no tiene sentido restaurar el paso del código, porque el que
 * la persona tenga en el correo ya no sirve.
 */
const OTP_TTL_MS = 10 * 60 * 1000;

/** Lo que se recuerda del envío en curso, por negocio. */
interface PendingOtp {
  email: string;
  /** Epoch ms del envío, para saber si el código sigue vivo. */
  sentAt: number;
  resendCount: number;
  /** Epoch ms hasta el que no se puede reenviar. */
  cooldownUntil: number;
}

function pendingKey(slug: string): string {
  return `agx_otp_${slug}`;
}

/**
 * Se usa `sessionStorage` y no `localStorage` a propósito: esto existe para
 * sobrevivir una recarga (se cortó internet, el navegador recargó la pestaña),
 * no para dejar el email de alguien guardado en un dispositivo compartido. Quien
 * cerró la pestaña entra por "Ya tengo un código".
 */
function readPending(slug: string): PendingOtp | null {
  try {
    const raw = sessionStorage.getItem(pendingKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingOtp>;
    if (typeof parsed.email !== 'string' || typeof parsed.sentAt !== 'number') return null;
    if (Date.now() - parsed.sentAt >= OTP_TTL_MS) return null;
    return {
      email: parsed.email,
      sentAt: parsed.sentAt,
      resendCount: typeof parsed.resendCount === 'number' ? parsed.resendCount : 0,
      cooldownUntil: typeof parsed.cooldownUntil === 'number' ? parsed.cooldownUntil : 0,
    };
  } catch {
    // Storage bloqueado (modo privado, permisos) o JSON corrupto: se sigue sin
    // restaurar, que es exactamente el comportamiento que había antes.
    return null;
  }
}

function writePending(slug: string, pending: PendingOtp): void {
  try {
    sessionStorage.setItem(pendingKey(slug), JSON.stringify(pending));
  } catch {
    /* Sin storage el flujo funciona igual, solo no sobrevive la recarga. */
  }
}

function clearPending(slug: string): void {
  try {
    sessionStorage.removeItem(pendingKey(slug));
  } catch {
    /* idem */
  }
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Identificación del cliente por email + código de un solo uso.
 *
 * Vive acá y no adentro del wizard porque hay dos entradas al mismo flujo —
 * reservar un turno e iniciar sesión para ver los propios— y son el mismo par de
 * endpoints. Duplicarlo garantizaba que las esperas, el tope de reenvíos y el
 * manejo del 429 se desincronizaran entre las dos.
 */
export function CustomerAuth({
  slug,
  intro,
  back,
  onAuthenticated,
}: {
  slug: string;
  /** Texto que explica por qué se pide el email; cambia según de dónde se entre. */
  intro?: ReactNode;
  /** Acción secundaria de salida (volver al paso anterior, a la home, etc.). */
  back?: ReactNode;
  /** Corre con la sesión ya abierta. `profileComplete` dice si falta el perfil. */
  onAuthenticated: (result: {
    profileComplete: boolean;
    email: string;
  }) => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');
  /** Envíos hechos para el email actual (el inicial cuenta como 0 reenvíos). */
  const [resendCount, setResendCount] = useState(0);
  /** Momento (epoch ms) a partir del cual se puede volver a pedir un código. */
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendBlocked, setResendBlocked] = useState(false);

  // Restaura el envío en curso después de una recarga. Corre en un efecto y no
  // en el estado inicial porque `sessionStorage` no existe en el render del
  // servidor y la hidratación tiene que arrancar igual en los dos lados.
  useEffect(() => {
    const pending = readPending(slug);
    if (!pending) return;
    setEmail(pending.email);
    setOtpSent(true);
    setResendCount(pending.resendCount);
    setResendBlocked(pending.resendCount >= MAX_RESENDS);
    if (pending.cooldownUntil > Date.now()) setCooldownUntil(pending.cooldownUntil);
  }, [slug]);

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
    clearPending(slug);
  }

  /**
   * Salta al input del código sin pedir uno nuevo.
   *
   * Es la salida para quien ya recibió el código y perdió la pantalla: cerró la
   * pestaña, cambió de dispositivo, o recargó cuando ya no quedaba nada
   * guardado. `otp/verify` sólo necesita email y código —no una sesión ni el
   * estado previo—, así que el código del correo sirve igual. Sin esto, la única
   * salida era pedir otro y comerse la espera del reenvío teniendo uno válido en
   * la mano.
   */
  // Ojo con el nombre: llamarla `useExistingCode` haría que el linter de React
  // la tome por un Hook y proteste al invocarla desde un onClick.
  function enterExistingCode() {
    if (!email) {
      toast.error('Ingresá el email al que te llegó el código');
      return;
    }
    setOtpSent(true);
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
      // `details.retryAfterSeconds` lo pone el tope por email del backend; la
      // cabecera `Retry-After`, el rate limiter por IP. Cualquiera de los dos
      // sabe más que una espera adivinada acá.
      const retry =
        Number(data?.details?.retryAfterSeconds) ||
        Number(r.headers.get('retry-after')) ||
        RESEND_DELAYS_SECONDS[0]!;
      const cooldownUntilMs = Date.now() + retry * 1000;
      setOtpSent(true);
      setCooldownUntil(cooldownUntilMs);
      if (resendCount >= MAX_RESENDS) setResendBlocked(true);
      writePending(slug, {
        email,
        sentAt: Date.now(),
        resendCount,
        cooldownUntil: cooldownUntilMs,
      });
      // Un 429 en el **primer** intento de esta pantalla no es un error del
      // usuario: quiere decir que ya hay un código andando, casi siempre porque
      // recargó. Lo que corresponde es mandarlo a revisar el correo, no darle un
      // cartel rojo por algo que ya tiene resuelto.
      if (!otpSent) {
        toast.info('Ya te habíamos enviado un código', {
          description: `Revisá el correo de ${email} (y la carpeta de spam) e ingresalo acá.`,
        });
      } else {
        toast.error(data.message || 'Esperá unos segundos antes de pedir otro código');
      }
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
    const cooldownUntilMs = Date.now() + wait * 1000;
    setResendCount(nextCount);
    setOtpSent(true);
    setCooldownUntil(cooldownUntilMs);
    if (nextCount >= MAX_RESENDS) setResendBlocked(true);
    // Se recuerda el envío para que una recarga vuelva al paso del código en vez
    // de mandar a pedir otro teniendo uno válido en el correo.
    writePending(slug, {
      email,
      sentAt: Date.now(),
      resendCount: nextCount,
      cooldownUntil: cooldownUntilMs,
    });
    toast.success('Te enviamos un código', {
      description: 'Si no lo ves en la bandeja de entrada, revisá la carpeta de spam.',
    });
  }

  /**
   * `submittedCode` llega cuando el disparo viene de completar la última casilla:
   * en ese momento el estado `code` todavía no se actualizó, así que hay que usar
   * el valor que manda el input y no el de la clausura.
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
    // El código ya se consumió: dejarlo guardado haría que la próxima visita
    // restaurara un paso muerto.
    clearPending(slug);
    await onAuthenticated({ profileComplete: Boolean(data.profileComplete), email });
  }

  return (
    <>
      {intro ? <p className="text-sm text-muted-foreground">{intro}</p> : null}

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
          {/* Para quien vuelve con el código ya en el correo. Sin esta salida,
              pedir otro es la única opción y la espera del reenvío lo deja
              trabado teniendo uno válido. */}
          <button
            type="button"
            onClick={enterExistingCode}
            className="w-full text-center text-xs font-medium text-primary hover:underline"
          >
            Ya tengo un código
          </button>
          {back}
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
              Te lo enviamos a <span className="font-medium">{email}</span>. Si no lo ves
              en unos segundos, <strong>revisá la carpeta de spam</strong> o correo no
              deseado.
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
            {back ?? <span />}
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
              Alcanzaste el límite de reenvíos. Esperá unos minutos y volvé a intentar, o
              comunicate con el negocio para reservar por otra vía.
            </p>
          ) : null}
        </>
      )}
    </>
  );
}
