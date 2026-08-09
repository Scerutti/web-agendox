// Utilidades de fecha por CLAVE de calendario (YYYY-MM-DD). Se trabaja a mediodía
// UTC para evitar corrimientos por zona horaria del navegador.

export function parseKey(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00Z`);
}

export function toKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(dateStr: string, n: number): string {
  const d = parseKey(dateStr);
  d.setUTCDate(d.getUTCDate() + n);
  return toKey(d);
}

/** Lunes de la semana que contiene dateStr. */
export function weekStart(dateStr: string): string {
  const dow = parseKey(dateStr).getUTCDay(); // 0=Dom
  const diff = (dow + 6) % 7; // días desde el lunes
  return addDays(dateStr, -diff);
}

export function weekDays(dateStr: string): string[] {
  const start = weekStart(dateStr);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatDayHeader(dateStr: string, locale = 'es-AR'): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(parseKey(dateStr));
}
