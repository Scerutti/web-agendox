'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, cn } from '@agendox/ui';
import { formatTimeInOrgTz, getZonedParts, zonedDayKey } from '@agendox/domain';
import type { AppointmentStatus } from '@agendox/domain';
import { APPOINTMENT_STATUS_UI } from '@/lib/appointment-ui';
import { addDays, formatDayHeader, weekDays } from './date-utils';
import { CreateAppointmentDialog } from './create-appointment-dialog';
import { AppointmentDetailDialog } from './appointment-detail-dialog';
import type { AppointmentView } from '@/lib/api/appointments';
import type { ServiceView } from '@/lib/api/services';
import type { ResourceView } from '@/lib/api/resources';

type View = 'day' | 'week';

const HOUR_PX = 48;
const DEFAULT_START_MIN = 8 * 60;
const DEFAULT_END_MIN = 20 * 60;
// Alto mínimo del bloque: una línea de `text-xs` (16px) más el padding (8px).
// Por debajo de eso el primer renglón sale cortado.
const MIN_BLOCK_PX = 24;

// Los controles son `h-10` en mobile (área táctil) y vuelven a `h-9` desde `sm`
// para no engordar la toolbar del escritorio.
// `min-w-0`: el select de recursos mide, como mínimo, el nombre de recurso más
// largo. Dentro de la grilla de la toolbar eso empujaba la página a lo ancho en
// mobile.
const selectClass =
  'h-10 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-auto';

const STATUS_ORDER: AppointmentStatus[] = [
  'PENDING_APPROVAL',
  'PENDING_DEPOSIT',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
  'NO_SHOW',
];

interface DayEvent {
  appointment: AppointmentView;
  startMin: number;
  endMin: number;
}

interface PositionedEvent extends DayEvent {
  col: number;
  cols: number;
}

export function CalendarView({
  appointments,
  resources,
  services,
  timezone,
  view,
  date,
  resourceId,
  status,
  todayKey,
}: {
  appointments: AppointmentView[];
  resources: ResourceView[];
  services: ServiceView[];
  timezone: string;
  view: View;
  date: string;
  resourceId?: string;
  status?: AppointmentStatus;
  todayKey: string;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<AppointmentView | null>(null);

  function go(next: {
    view?: View;
    date?: string;
    resourceId?: string;
    status?: string;
  }) {
    const v = next.view ?? view;
    const d = next.date ?? date;
    const rid = next.resourceId !== undefined ? next.resourceId : resourceId;
    // El estado se propaga igual que el recurso: si no se re-emitiera, cambiar
    // de día o de vista perdería el filtro elegido.
    const st = next.status !== undefined ? next.status : status;
    const params = new URLSearchParams({ view: v, date: d });
    if (rid) params.set('resourceId', rid);
    if (st) params.set('status', st);
    router.push(`/calendar?${params.toString()}`);
  }

  const step = view === 'week' ? 7 : 1;
  const days = view === 'week' ? weekDays(date) : [date];

  // Group appointments by local day, with their wall-clock minute offsets.
  const byDay = new Map<string, DayEvent[]>();
  for (const a of appointments) {
    const key = zonedDayKey(a.startsAt, timezone);
    if (!days.includes(key)) continue;
    const parts = getZonedParts(a.startsAt, timezone);
    const startMin = parts.hour * 60 + parts.minute;
    const endMin = startMin + a.durationMinutes;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push({ appointment: a, startMin, endMin });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:space-y-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 flex-1 sm:h-9 sm:flex-none"
            aria-label={view === 'week' ? 'Semana anterior' : 'Día anterior'}
            onClick={() => go({ date: addDays(date, -step) })}
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 flex-1 sm:h-9 sm:flex-none"
            onClick={() => go({ date: todayKey })}
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 flex-1 sm:h-9 sm:flex-none"
            aria-label={view === 'week' ? 'Semana siguiente' : 'Día siguiente'}
            onClick={() => go({ date: addDays(date, step) })}
          >
            →
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <select
            className={cn(selectClass, 'col-span-2 sm:col-span-1')}
            aria-label="Filtrar por recurso"
            value={resourceId ?? ''}
            onChange={(e) => go({ resourceId: e.target.value })}
          >
            <option value="">Todos los recursos</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            aria-label="Filtrar por estado"
            value={status ?? ''}
            onChange={(e) => go({ status: e.target.value })}
          >
            <option value="">Todos los estados</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {APPOINTMENT_STATUS_UI[s].label}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            aria-label="Vista del calendario"
            value={view}
            onChange={(e) => go({ view: e.target.value as View })}
          >
            <option value="week">Semana</option>
            <option value="day">Día</option>
          </select>
          <Button
            className="col-span-2 h-10 sm:col-span-1 sm:h-9"
            onClick={() => setCreating(true)}
          >
            Nuevo turno
          </Button>
        </div>
      </div>

      {/*
        Dos lecturas de los mismos datos, elegidas por CSS y no por JavaScript:
        resolverlo con `window.innerWidth` daría un desajuste de hidratación y un
        parpadeo en la primera pintura. La grilla horaria necesita ~950px en
        semana, así que en un teléfono se lee como agenda.
      */}
      <CalendarGrid
        days={days}
        byDay={byDay}
        timezone={timezone}
        todayKey={todayKey}
        onSelect={setSelected}
      />
      <CalendarAgenda
        days={days}
        byDay={byDay}
        timezone={timezone}
        todayKey={todayKey}
        onSelect={setSelected}
      />

      <CreateAppointmentDialog
        open={creating}
        onOpenChange={setCreating}
        services={services}
        resources={resources}
        defaultDate={date}
        timezone={timezone}
      />
      <AppointmentDetailDialog
        appointment={selected}
        open={!!selected}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
        timezone={timezone}
      />
    </div>
  );
}

interface ViewProps {
  days: string[];
  byDay: Map<string, DayEvent[]>;
  timezone: string;
  todayKey: string;
  onSelect: (appointment: AppointmentView) => void;
}

/** Grilla horaria con bloques posicionados. Desde `sm` para arriba. */
function CalendarGrid({ days, byDay, timezone, todayKey, onSelect }: ViewProps) {
  // Vertical range: default 08–20, expanded to fit any out-of-range appointment.
  let rangeStart = DEFAULT_START_MIN;
  let rangeEnd = DEFAULT_END_MIN;
  for (const list of byDay.values()) {
    for (const e of list) {
      rangeStart = Math.min(rangeStart, e.startMin);
      rangeEnd = Math.max(rangeEnd, e.endMin);
    }
  }
  rangeStart = Math.max(0, Math.floor(rangeStart / 60) * 60);
  rangeEnd = Math.min(24 * 60, Math.ceil(rangeEnd / 60) * 60);
  const gridHeight = ((rangeEnd - rangeStart) / 60) * HOUR_PX;
  const hourMarks: number[] = [];
  for (let m = rangeStart; m < rangeEnd; m += 60) hourMarks.push(m);

  return (
    <div className="hidden overflow-x-auto rounded-lg border sm:block">
      <div className="flex min-w-[560px]">
        {/* Time axis */}
        <div className="w-14 shrink-0 border-r">
          <div className="h-9 border-b" />
          <div className="relative" style={{ height: gridHeight }}>
            {hourMarks.map((m) => (
              <div
                key={m}
                className="absolute right-1 -translate-y-1/2 text-xs text-muted-foreground"
                style={{ top: ((m - rangeStart) / 60) * HOUR_PX }}
              >
                {String(Math.floor(m / 60)).padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>

        {/* Day columns */}
        <div className="flex flex-1">
          {days.map((day) => {
            const positioned = layoutDay(byDay.get(day) ?? []);
            const isToday = day === todayKey;
            return (
              <div key={day} className="min-w-[8rem] flex-1 border-r last:border-r-0">
                <div
                  className={
                    'flex h-9 items-center justify-center border-b text-sm font-medium capitalize ' +
                    (isToday ? 'bg-accent' : 'bg-muted/40')
                  }
                >
                  {formatDayHeader(day)}
                </div>
                <div className="relative" style={{ height: gridHeight }}>
                  {hourMarks.map((m) => (
                    <div
                      key={m}
                      className="absolute inset-x-0 border-b border-dashed border-border/50"
                      style={{ top: ((m - rangeStart) / 60) * HOUR_PX }}
                    />
                  ))}
                  {positioned.map((ev) => {
                    const ui = APPOINTMENT_STATUS_UI[ev.appointment.status];
                    const top = ((ev.startMin - rangeStart) / 60) * HOUR_PX;
                    const height = Math.max(
                      ((ev.endMin - ev.startMin) / 60) * HOUR_PX,
                      MIN_BLOCK_PX,
                    );
                    const width = 100 / ev.cols;
                    // El bloque mide lo que dura el turno: en media hora no hay
                    // lugar para tres líneas y la etiqueta de estado salía
                    // cortada por el `overflow-hidden` ("Seña pendiente" era la
                    // peor). Se muestra sólo lo que entra; el estado igual queda
                    // legible en el punto de color, en el `title` y en el
                    // detalle del turno. Alturas con `text-xs`: línea 16px,
                    // badge 24px, padding del bloque 8px.
                    const showClient = height >= 40;
                    const showStatus = height >= 64 && ev.cols === 1;
                    return (
                      <button
                        key={ev.appointment.id}
                        type="button"
                        onClick={() => onSelect(ev.appointment)}
                        title={`${formatTimeInOrgTz(ev.appointment.startsAt, timezone)} · ${ev.appointment.serviceName} · ${ev.appointment.clientName} · ${ui.label}`}
                        className="absolute overflow-hidden rounded-md border bg-card p-1 text-left text-xs shadow-sm hover:z-10 hover:ring-2 hover:ring-ring"
                        style={{
                          top,
                          height,
                          left: `calc(${ev.col * width}% + 2px)`,
                          width: `calc(${width}% - 4px)`,
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              'h-1.5 w-1.5 shrink-0 rounded-full',
                              ui.dot,
                            )}
                            aria-hidden
                          />
                          <span className="truncate font-medium">
                            {formatTimeInOrgTz(ev.appointment.startsAt, timezone)}{' '}
                            {ev.appointment.serviceName}
                          </span>
                        </div>
                        {showClient ? (
                          <div className="truncate text-muted-foreground">
                            {ev.appointment.clientName}
                          </div>
                        ) : null}
                        {showStatus ? (
                          <Badge
                            variant={ui.variant}
                            className="mt-0.5 max-w-full truncate"
                          >
                            {ui.short}
                          </Badge>
                        ) : (
                          <span className="sr-only">{ui.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Lectura de agenda para teléfonos: la misma información en lista cronológica.
 * Se pierde la noción visual de hueco entre turnos —el precio de no tener 950px
 * de ancho—, pero no se pierde ninguna acción: el turno se toca y abre el mismo
 * detalle, y el alta y los filtros viven en la toolbar compartida.
 */
function CalendarAgenda({ days, byDay, timezone, todayKey, onSelect }: ViewProps) {
  return (
    <div className="space-y-4 sm:hidden">
      {days.map((day) => {
        const events = [...(byDay.get(day) ?? [])].sort(
          (a, b) => a.startMin - b.startMin || a.endMin - b.endMin,
        );
        const isToday = day === todayKey;
        return (
          <section key={day} className="space-y-2">
            <h3
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium capitalize',
                isToday ? 'bg-accent text-accent-foreground' : 'bg-muted/60',
              )}
            >
              {formatDayHeader(day)}
            </h3>
            {events.length === 0 ? (
              <p className="px-3 pb-1 text-sm text-muted-foreground">Sin turnos</p>
            ) : (
              <ul className="space-y-2">
                {events.map((ev) => {
                  const ui = APPOINTMENT_STATUS_UI[ev.appointment.status];
                  return (
                    <li key={ev.appointment.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(ev.appointment)}
                        className="flex min-h-[56px] w-full flex-col gap-1 rounded-md border bg-card p-3 text-left shadow-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium">
                            {formatTimeInOrgTz(ev.appointment.startsAt, timezone)}
                            {' – '}
                            {formatTimeInOrgTz(ev.appointment.endsAt, timezone)}
                          </span>
                          <Badge variant={ui.variant}>{ui.label}</Badge>
                        </div>
                        <span className="text-sm">{ev.appointment.serviceName}</span>
                        <span className="text-xs text-muted-foreground">
                          {ev.appointment.clientName} · {ev.appointment.resourceName}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

/**
 * Lays out a day's appointments into side-by-side columns so overlapping turns
 * don't cover each other. Standard cluster algorithm: greedy column assignment
 * within each maximal chain of overlapping events.
 */
function layoutDay(events: DayEvent[]): PositionedEvent[] {
  const sorted = [...events].sort(
    (a, b) => a.startMin - b.startMin || a.endMin - b.endMin,
  );
  const result: PositionedEvent[] = [];
  let cluster: (DayEvent & { col: number })[] = [];
  let clusterEnd = -1;

  const flush = () => {
    const columnEnds: number[] = [];
    for (const ev of cluster) {
      let c = 0;
      while (c < columnEnds.length && columnEnds[c]! > ev.startMin) c += 1;
      columnEnds[c] = ev.endMin;
      ev.col = c;
    }
    const cols = columnEnds.length;
    for (const ev of cluster) {
      result.push({
        appointment: ev.appointment,
        startMin: ev.startMin,
        endMin: ev.endMin,
        col: ev.col,
        cols,
      });
    }
    cluster = [];
  };

  for (const e of sorted) {
    if (cluster.length && e.startMin >= clusterEnd) {
      flush();
      clusterEnd = -1;
    }
    cluster.push({ ...e, col: 0 });
    clusterEnd = Math.max(clusterEnd, e.endMin);
  }
  if (cluster.length) flush();
  return result;
}
