'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Textarea,
  toast,
} from '@agendox/ui';
import { formatTimeInOrgTz } from '@agendox/domain';
import { Field } from '@/components/form/field';
import {
  createAppointment,
  fetchAvailability,
  fetchServiceOptions,
  searchClients,
} from './actions';
import type { AvailabilitySlot } from '@/lib/api/availability';
import type { ServiceView, ServiceOptionView } from '@/lib/api/services';
import type { ResourceView } from '@/lib/api/resources';
import type { ClientView } from '@/lib/api/clients';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  services,
  resources,
  defaultDate,
  timezone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  services: ServiceView[];
  resources: ResourceView[];
  defaultDate: string;
  timezone: string;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [clientQuery, setClientQuery] = useState('');
  const [clientResults, setClientResults] = useState<ClientView[]>([]);
  const clientSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [serviceId, setServiceId] = useState('');
  const [options, setOptions] = useState<ServiceOptionView[]>([]);
  const [serviceOptionId, setServiceOptionId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [slots, setSlots] = useState<AvailabilitySlot[] | null>(null);
  const [selected, setSelected] = useState<AvailabilitySlot | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  async function onServiceChange(id: string) {
    setServiceId(id);
    setServiceOptionId('');
    setOptions([]);
    setSlots(null);
    setSelected(null);
    if (!id) return;
    try {
      const opts = await fetchServiceOptions(id);
      setOptions(opts.filter((o) => o.active));
    } catch {
      toast.error('No se pudieron cargar las opciones');
    }
  }

  async function search() {
    if (!serviceId || !serviceOptionId) {
      toast.error('Elegí servicio y opción');
      return;
    }
    setBusy(true);
    setSelected(null);
    const res = await fetchAvailability({
      serviceId,
      serviceOptionId,
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

  function onClientQueryChange(value: string) {
    setClientQuery(value);
    setClientId('');
    if (clientSearchTimer.current) clearTimeout(clientSearchTimer.current);
    if (value.trim().length < 2) {
      setClientResults([]);
      return;
    }
    clientSearchTimer.current = setTimeout(() => {
      void searchClients(value).then(setClientResults);
    }, 250);
  }

  function selectClient(client: ClientView) {
    setClientId(client.id);
    setClientQuery(`${client.firstName} ${client.lastName} · ${client.email}`);
    setClientResults([]);
  }

  async function confirm() {
    if (!clientId) {
      toast.error('Elegí un cliente');
      return;
    }
    if (!selected) {
      toast.error('Elegí un horario');
      return;
    }
    setBusy(true);
    const res = await createAppointment({
      serviceId,
      serviceOptionId,
      resourceId: selected.resourceId,
      clientId,
      startsAt: selected.start,
      notes: notes || undefined,
    });
    setBusy(false);
    if (res.ok) {
      toast.success('Turno creado');
      onOpenChange(false);
      router.refresh();
      return;
    }
    if (res.conflict) {
      toast.error('Ese horario se acaba de ocupar. Actualizamos la disponibilidad.');
      setSelected(null);
      await search();
      return;
    }
    toast.error(res.message);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Nuevo turno</DialogTitle>
      </DialogHeader>

      <div className="space-y-3">
        <Field label="Cliente" htmlFor="clientQuery">
          <div className="relative">
            <Input
              id="clientQuery"
              autoComplete="off"
              placeholder="Buscá por nombre, email o WhatsApp…"
              value={clientQuery}
              onChange={(e) => onClientQueryChange(e.target.value)}
            />
            {!clientId && clientResults.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                {clientResults.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selectClient(c)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      <span className="font-medium">
                        {c.firstName} {c.lastName}
                      </span>{' '}
                      <span className="text-muted-foreground">· {c.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Servicio" htmlFor="serviceId">
            <select
              id="serviceId"
              className={selectClass}
              value={serviceId}
              onChange={(e) => onServiceChange(e.target.value)}
            >
              <option value="">Servicio…</option>
              {services
                .filter((s) => s.active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Opción" htmlFor="serviceOptionId">
            <select
              id="serviceOptionId"
              className={selectClass}
              value={serviceOptionId}
              onChange={(e) => {
                setServiceOptionId(e.target.value);
                setSlots(null);
                setSelected(null);
              }}
              disabled={!options.length}
            >
              <option value="">Opción…</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} · {o.durationMinutes} min
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Recurso" htmlFor="resourceId">
            <select
              id="resourceId"
              className={selectClass}
              value={resourceId}
              onChange={(e) => {
                setResourceId(e.target.value);
                setSlots(null);
                setSelected(null);
              }}
            >
              <option value="">Cualquiera</option>
              {resources
                .filter((r) => r.active)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Fecha" htmlFor="date">
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSlots(null);
                setSelected(null);
              }}
            />
          </Field>
        </div>

        <Button type="button" variant="outline" onClick={search} disabled={busy}>
          {busy ? 'Buscando…' : 'Buscar disponibilidad'}
        </Button>

        {slots !== null && (
          <div className="rounded-md border p-3">
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin horarios disponibles para ese día.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => {
                  const isSel = selected?.start === slot.start && selected?.resourceId === slot.resourceId;
                  return (
                    <button
                      key={`${slot.resourceId}-${slot.start}`}
                      type="button"
                      onClick={() => setSelected(slot)}
                      className={
                        'rounded-md border px-3 py-1.5 text-sm ' +
                        (isSel
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'hover:bg-accent')
                      }
                    >
                      {formatTimeInOrgTz(slot.start, timezone)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <Field label="Notas (opcional)" htmlFor="notes">
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={confirm} disabled={busy || !selected}>
          Crear turno
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
