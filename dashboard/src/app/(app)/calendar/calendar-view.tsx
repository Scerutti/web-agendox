'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button } from '@agendox/ui';
import { formatTimeInOrgTz, getZonedParts, zonedDayKey } from '@agendox/domain';
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
const MIN_BLOCK_PX = 22;

const selectClass =
  'h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface PositionedEvent {
  appointment: AppointmentView;
  startMin: number;
  endMin: number;
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
  todayKey,
}: {
  appointments: AppointmentView[];
  resources: ResourceView[];
  services: ServiceView[];
  timezone: string;
  view: View;
  date: string;
  resourceId?: string;
  todayKey: string;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<AppointmentView | null>(null);

  function go(next: { view?: View; date?: string; resourceId?: string }) {
    const v = next.view ?? view;
    const d = next.date ?? date;
    const rid = next.resourceId !== undefined ? next.resourceId : resourceId;
    const params = new URLSearchParams({ view: v, date: d });
    if (rid) params.set('resourceId', rid);
    router.push(`/calendar?${params.toString()}`);
  }

  const step = view === 'week' ? 7 : 1;
  const days = view === 'week' ? weekDays(date) : [date];

  // Group appointments by local day, with their wall-clock minute offsets.
  const byDay = new Map<string, { appointment: AppointmentView; startMin: number; endMin: number }[]>();
  for (const a of appointments) {
    const key = zonedDayKey(a.startsAt, timezone);
    if (!days.includes(key)) continue;
    const parts = getZonedParts(a.startsAt, timezone);
    const startMin = parts.hour * 60 + parts.minute;
    const endMin = startMin + a.durationMinutes;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push({ appointment: a, startMin, endMin });
  }

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => go({ date: addDays(date, -step) })}>
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={() => go({ date: todayKey })}>
            Hoy
          </Button>
          <Button variant="outline" size="sm" onClick={() => go({ date: addDays(date, step) })}>
            →
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className={selectClass}
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
            value={view}
            onChange={(e) => go({ view: e.target.value as View })}
          >
            <option value="week">Semana</option>
            <option value="day">Día</option>
          </select>
          <Button size="sm" onClick={() => setCreating(true)}>
            Nuevo turno
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
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
                      return (
                        <button
                          key={ev.appointment.id}
                          type="button"
                          onClick={() => setSelected(ev.appointment)}
                          className="absolute overflow-hidden rounded-md border bg-card p-1 text-left text-xs shadow-sm hover:z-10 hover:ring-2 hover:ring-ring"
                          style={{
                            top,
                            height,
                            left: `calc(${ev.col * width}% + 2px)`,
                            width: `calc(${width}% - 4px)`,
                          }}
                        >
                          <div className="truncate font-medium">
                            {formatTimeInOrgTz(ev.appointment.startsAt, timezone)}{' '}
                            {ev.appointment.serviceName}
                          </div>
                          <div className="truncate text-muted-foreground">
                            {ev.appointment.clientName}
                          </div>
                          <Badge variant={ui.variant} className="mt-0.5">
                            {ui.label}
                          </Badge>
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

/**
 * Lays out a day's appointments into side-by-side columns so overlapping turns
 * don't cover each other. Standard cluster algorithm: greedy column assignment
 * within each maximal chain of overlapping events.
 */
function layoutDay(
  events: { appointment: AppointmentView; startMin: number; endMin: number }[],
): PositionedEvent[] {
  const sorted = [...events].sort(
    (a, b) => a.startMin - b.startMin || a.endMin - b.endMin,
  );
  const result: PositionedEvent[] = [];
  let cluster: { appointment: AppointmentView; startMin: number; endMin: number; col: number }[] = [];
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
