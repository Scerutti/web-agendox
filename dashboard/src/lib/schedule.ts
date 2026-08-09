export interface Interval {
  start: string;
  end: string;
}

export type WeekIntervals = Record<number, Interval[]>;

/**
 * Parsea el JSON serializado por `WeeklyIntervalsEditor` (input hidden) a un
 * mapa por día con intervalos válidos (`HH:MM`, start < end). Robusto ante
 * valores nulos/inválidos: devuelve un mapa vacío o filtra lo malo.
 */
export function parseWeekIntervals(raw: FormDataEntryValue | null): WeekIntervals {
  if (typeof raw !== 'string') return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== 'object') return {};

  const week: WeekIntervals = {};
  for (let d = 0; d < 7; d++) {
    const value = (parsed as Record<string, unknown>)[String(d)];
    if (!Array.isArray(value)) continue;
    const intervals: Interval[] = [];
    for (const item of value) {
      const start = normalizeTime((item as { start?: unknown })?.start);
      const end = normalizeTime((item as { end?: unknown })?.end);
      if (start && end && start < end) intervals.push({ start, end });
    }
    if (intervals.length > 0) week[d] = intervals;
  }
  return week;
}

function normalizeTime(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null;
}
