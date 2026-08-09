// Helpers de formato. Regla dura del MVP: los horarios se renderizan SIEMPRE
// en la timezone de la organización (viene en /organizations/current y
// /public/:slug), nunca en la del navegador.

const DEFAULT_LOCALE = 'es-AR';

/**
 * Formatea un monto. El backend envía números decimales (ej. 100.5) en la
 * moneda de la org. `currency` es un código ISO 4217 (default ARS).
 */
export function formatMoney(
  value: number,
  currency = 'ARS',
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Formatea un instante ISO 8601 UTC en la timezone de la org.
 * @param iso instante ISO (ej. "2026-08-03T12:00:00.000Z")
 * @param timeZone IANA (ej. "America/Argentina/Buenos_Aires")
 */
export function formatInOrgTz(
  iso: string,
  timeZone: string,
  opts?: Intl.DateTimeFormatOptions,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
    ...opts,
  }).format(new Date(iso));
}

export function formatTimeInOrgTz(
  iso: string,
  timeZone: string,
  locale: string = DEFAULT_LOCALE,
): string {
  return formatInOrgTz(iso, timeZone, { dateStyle: undefined, timeStyle: 'short' }, locale);
}

export function formatDateInOrgTz(
  iso: string,
  timeZone: string,
  locale: string = DEFAULT_LOCALE,
): string {
  return formatInOrgTz(iso, timeZone, { dateStyle: 'medium', timeStyle: undefined }, locale);
}

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 = domingo … 6 = sábado
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Descompone un instante ISO UTC en su hora de pared en la timezone dada. */
export function getZonedParts(iso: string, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(new Date(iso));

  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const hour = map.hour === '24' ? 0 : Number(map.hour);

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    weekday: WEEKDAY_INDEX[map.weekday ?? 'Sun'] ?? 0,
  };
}

/** Clave de día local (YYYY-MM-DD) del instante en la timezone dada. */
export function zonedDayKey(iso: string, timeZone: string): string {
  const p = getZonedParts(iso, timeZone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}
