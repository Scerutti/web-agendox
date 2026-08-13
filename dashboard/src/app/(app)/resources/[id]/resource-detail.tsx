'use client';

import { useActionState, useRef, useEffect } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ColorPicker,
  Input,
  Textarea,
} from '@agendox/ui';
import { formatInOrgTz } from '@agendox/domain';
import { Field } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import { BLOCKED_TIME_TYPE_UI } from '@/lib/blocked-time-ui';
import {
  assignService,
  createBlockedTime,
  deleteBlockedTime,
  saveSchedule,
  setResourceActive,
  unassignService,
  updateResource,
} from '../actions';
import type {
  BlockedTimeView,
  ResourceDetailView,
} from '@/lib/api/resources';
import type { ServiceView } from '@/lib/api/services';
import { userDisplayName, type UserView } from '@/lib/api/users.types';
import {
  WeeklyIntervalsEditor,
  type WeekIntervals,
} from '@/components/schedule/weekly-intervals-editor';

// Ver `resource-create.tsx`: `min-w-0` evita que la opción más larga del
// select (un nombre de usuario) estire la grilla y con ella la página.
const selectClass =
  'flex h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function ResourceDetail({
  resource,
  services,
  blockedTimes,
  timezone,
  users,
}: {
  resource: ResourceDetailView;
  services: ServiceView[];
  blockedTimes: BlockedTimeView[];
  timezone: string;
  users: UserView[];
}) {
  return (
    <div className="space-y-6">
      <BasicInfo resource={resource} users={users} />
      <ScheduleEditor resource={resource} />
      <ServicesAssignment resource={resource} services={services} />
      <BlockedTimes
        resourceId={resource.id}
        blockedTimes={blockedTimes}
        timezone={timezone}
      />
    </div>
  );
}

function BasicInfo({
  resource,
  users,
}: {
  resource: ResourceDetailView;
  users: UserView[];
}) {
  const [state, action] = useActionState(updateResource, IDLE_STATE);
  useActionFeedback(state);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Datos del recurso
          <Badge variant={resource.active ? 'success' : 'muted'}>
            {resource.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={action} className="space-y-3">
          <input type="hidden" name="id" defaultValue={resource.id} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="name">
              <Input id="name" name="name" defaultValue={resource.name} required />
            </Field>
            <Field
              label="Tipo"
              htmlFor="type"
              info="Etiqueta libre para agrupar tus recursos (persona, cancha, sala, box, equipamiento). No cambia cómo funcionan los turnos."
            >
              <Input id="type" name="type" defaultValue={resource.type} required />
            </Field>
            <Field
              label="Color"
              htmlFor="color"
              hint="Para distinguirlo en el calendario."
            >
              <ColorPicker
                id="color"
                name="color"
                defaultValue={resource.color ?? '#2563eb'}
                clearable={false}
              />
            </Field>
            <Field label="Usuario asignado" htmlFor="userId">
              <select
                id="userId"
                name="userId"
                className={selectClass}
                defaultValue={resource.userId ?? ''}
              >
                <option value="">Sin asignar</option>
                {users
                  .filter((u) => u.status === 'ACTIVE' || u.id === resource.userId)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {userDisplayName(u)}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
          <Field label="Descripción" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              defaultValue={resource.description ?? ''}
            />
          </Field>
          <SubmitButton>Guardar</SubmitButton>
        </form>
        <form action={setResourceActive.bind(null, resource.id, !resource.active)}>
          <Button type="submit" variant="outline">
            {resource.active ? 'Desactivar recurso' : 'Activar recurso'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ScheduleEditor({ resource }: { resource: ResourceDetailView }) {
  const [state, action] = useActionState(saveSchedule, IDLE_STATE);
  useActionFeedback(state);

  const initial: WeekIntervals = {};
  for (const e of resource.schedule) {
    (initial[e.dayOfWeek] ??= []).push({ start: e.startsAt, end: e.endsAt });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horario de atención</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-2">
          <input type="hidden" name="resourceId" defaultValue={resource.id} />
          <p className="text-sm text-muted-foreground">
            Varios intervalos por día (ej. mañana y tarde). Un día sin intervalos
            = no trabaja.
          </p>
          <WeeklyIntervalsEditor name="payload" initial={initial} emptyLabel="No trabaja" />
          <SubmitButton>Guardar horario</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

function ServicesAssignment({
  resource,
  services,
}: {
  resource: ResourceDetailView;
  services: ServiceView[];
}) {
  const assigned = new Set(resource.serviceIds);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Servicios que ofrece</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {services.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay servicios. Creá servicios primero.
          </p>
        )}
        {services.map((s) => {
          const isAssigned = assigned.has(s.id);
          return (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 rounded-md border p-2"
            >
              <span className="min-w-0 break-words text-sm">{s.name}</span>
              <form
                action={
                  isAssigned
                    ? unassignService.bind(null, resource.id, s.id)
                    : assignService.bind(null, resource.id, s.id)
                }
              >
                <Button
                  type="submit"
                  variant={isAssigned ? 'outline' : 'default'}
                  size="sm"
                >
                  {isAssigned ? 'Quitar' : 'Asignar'}
                </Button>
              </form>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function BlockedTimes({
  resourceId,
  blockedTimes,
  timezone,
}: {
  resourceId: string;
  blockedTimes: BlockedTimeView[];
  timezone: string;
}) {
  const [state, action] = useActionState(createBlockedTime, IDLE_STATE);
  useActionFeedback(state);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === 'success') ref.current?.reset();
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bloqueos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {blockedTimes.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin bloqueos.</p>
          )}
          {blockedTimes.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
            >
              {/* Las fechas formateadas son tokens largos sin espacios: sin
                  `min-w-0` la fila no podía encogerse en un teléfono. */}
              <span className="min-w-0 break-words">
                <Badge variant={BLOCKED_TIME_TYPE_UI[b.type].variant}>
                  {BLOCKED_TIME_TYPE_UI[b.type].label}
                </Badge>{' '}
                {formatInOrgTz(b.startsAt, timezone)} →{' '}
                {formatInOrgTz(b.endsAt, timezone)}
                {b.reason ? ` · ${b.reason}` : ''}
              </span>
              <form
                className="shrink-0"
                action={deleteBlockedTime.bind(null, b.id, resourceId)}
              >
                <Button type="submit" variant="ghost" size="sm">
                  Eliminar
                </Button>
              </form>
            </div>
          ))}
        </div>

        <form ref={ref} action={action} className="space-y-3 border-t pt-4">
          <input type="hidden" name="resourceId" defaultValue={resourceId} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Desde" htmlFor="startsAt">
              <Input
                id="startsAt"
                name="startsAt"
                type="datetime-local"
                required
              />
            </Field>
            <Field label="Hasta" htmlFor="endsAt">
              <Input id="endsAt" name="endsAt" type="datetime-local" required />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Tipo" htmlFor="type">
              <select id="type" name="type" className={selectClass} defaultValue="MANUAL">
                <option value="VACATION">Vacaciones</option>
                <option value="LICENSE">Licencia</option>
                <option value="MAINTENANCE">Mantenimiento</option>
                <option value="MANUAL">Manual</option>
              </select>
            </Field>
            <Field label="Motivo" htmlFor="reason">
              <Input id="reason" name="reason" />
            </Field>
          </div>
          <SubmitButton>Agregar bloqueo</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
