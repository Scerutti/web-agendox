'use client';

import { useMemo, useState } from 'react';
import { Button, Input } from '@agendox/ui';
import type { Interval, WeekIntervals } from '@/lib/schedule';

export type { Interval, WeekIntervals } from '@/lib/schedule';

const DAY_LABELS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

/**
 * Editor de intervalos semanales (horarios partidos): cada día admite 0..N
 * intervalos. Un día sin intervalos = cerrado / no trabaja. Serializa el estado
 * a un input hidden (`name`) como JSON `{ [dayOfWeek]: {start,end}[] }` que la
 * server action parsea.
 */
export function WeeklyIntervalsEditor({
  name,
  initial,
  addLabel = 'Agregar intervalo',
  emptyLabel = 'Cerrado',
}: {
  name: string;
  initial: WeekIntervals;
  addLabel?: string;
  emptyLabel?: string;
}) {
  const [week, setWeek] = useState<WeekIntervals>(() => normalize(initial));

  const payload = useMemo(() => JSON.stringify(week), [week]);

  function update(day: number, intervals: Interval[]) {
    setWeek((prev) => ({ ...prev, [day]: intervals }));
  }

  function addInterval(day: number) {
    const current = week[day] ?? [];
    const last = current[current.length - 1];
    const next: Interval = last
      ? { start: last.end, end: last.end }
      : { start: '09:00', end: '18:00' };
    update(day, [...current, next]);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={payload} readOnly />
      {DAY_LABELS.map((label, day) => {
        const intervals = week[day] ?? [];
        return (
          <div key={day} className="rounded-md border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{label}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addInterval(day)}
              >
                {addLabel}
              </Button>
            </div>
            {intervals.length === 0 ? (
              <p className="text-xs text-muted-foreground">{emptyLabel}</p>
            ) : (
              <div className="space-y-2">
                {intervals.map((interval, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={interval.start}
                      aria-label={`Inicio ${label} ${i + 1}`}
                      onChange={(e) =>
                        update(
                          day,
                          intervals.map((v, idx) =>
                            idx === i ? { ...v, start: e.target.value } : v,
                          ),
                        )
                      }
                      className="w-32"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="time"
                      value={interval.end}
                      aria-label={`Fin ${label} ${i + 1}`}
                      onChange={(e) =>
                        update(
                          day,
                          intervals.map((v, idx) =>
                            idx === i ? { ...v, end: e.target.value } : v,
                          ),
                        )
                      }
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => update(day, intervals.filter((_, idx) => idx !== i))}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Ensures all 7 days exist and times are `HH:MM`. */
function normalize(initial: WeekIntervals): WeekIntervals {
  const week: WeekIntervals = {};
  for (let d = 0; d < 7; d++) {
    week[d] = (initial[d] ?? []).map((i) => ({
      start: toHhMm(i.start),
      end: toHhMm(i.end),
    }));
  }
  return week;
}

function toHhMm(value: string): string {
  return value.slice(0, 5);
}
