'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
} from '@agendox/ui';
import { formatMoney } from '@agendox/domain';
import { Field } from '@/components/form/field';
import { SubmitButton } from '@/components/form/submit-button';
import { useActionFeedback } from '@/components/use-action-feedback';
import { IDLE_STATE } from '@/lib/actions';
import {
  createOption,
  setOptionActive,
  setServiceActive,
  updateOption,
  updateService,
} from '../actions';
import type {
  ServiceDetailView,
  ServiceOptionView,
} from '@/lib/api/services';

export function ServiceDetail({ service }: { service: ServiceDetailView }) {
  const [svcState, svcAction] = useActionState(updateService, IDLE_STATE);
  useActionFeedback(svcState);

  const [optState, optAction] = useActionState(createOption, IDLE_STATE);
  useActionFeedback(optState);
  const optFormRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (optState.status === 'success') optFormRef.current?.reset();
  }, [optState]);

  const [editing, setEditing] = useState<ServiceOptionView | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Datos del servicio
            <Badge variant={service.active ? 'success' : 'muted'}>
              {service.active ? 'Activo' : 'Inactivo'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={svcAction} className="space-y-3">
            <input type="hidden" name="id" defaultValue={service.id} />
            <Field label="Nombre" htmlFor="name">
              <Input id="name" name="name" defaultValue={service.name} required />
            </Field>
            <Field label="Descripción" htmlFor="description">
              <Textarea
                id="description"
                name="description"
                defaultValue={service.description ?? ''}
              />
            </Field>
            <SubmitButton>Guardar</SubmitButton>
          </form>
          <form action={setServiceActive.bind(null, service.id, !service.active)}>
            <Button type="submit" variant="outline">
              {service.active ? 'Desactivar servicio' : 'Activar servicio'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tarjetas en mobile: tres datos más dos acciones no entran en una
              fila de teléfono. Desde `sm` vuelve la tabla. */}
          <div className="space-y-3 sm:hidden">
            {service.options.length === 0 ? (
              <p className="rounded-md border p-4 text-center text-sm text-muted-foreground">
                Sin opciones. Agregá al menos una.
              </p>
            ) : (
              service.options.map((o) => (
                <div key={o.id} className="space-y-3 rounded-md border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{o.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {o.durationMinutes} min · {formatMoney(o.price)}
                      </p>
                    </div>
                    <Badge variant={o.active ? 'success' : 'muted'}>
                      {o.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t pt-3">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(o)}>
                      Editar
                    </Button>
                    <form
                      className="inline"
                      action={setOptionActive.bind(null, service.id, o.id, !o.active)}
                    >
                      <Button variant="ghost" size="sm" type="submit">
                        {o.active ? 'Desactivar' : 'Activar'}
                      </Button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto rounded-md border sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-3 font-medium">Opción</th>
                  <th className="p-3 font-medium">Duración</th>
                  <th className="p-3 font-medium">Precio</th>
                  <th className="p-3 font-medium">Estado</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {service.options.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 text-center text-muted-foreground"
                    >
                      Sin opciones. Agregá al menos una.
                    </td>
                  </tr>
                )}
                {service.options.map((o) => {
                  const active = o.active;
                  return (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="p-3 font-medium">{o.name}</td>
                      <td className="p-3">{o.durationMinutes} min</td>
                      <td className="p-3">{formatMoney(o.price)}</td>
                      <td className="p-3">
                        <Badge variant={active ? 'success' : 'muted'}>
                          {active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(o)}
                        >
                          Editar
                        </Button>
                        <form
                          className="inline"
                          action={setOptionActive.bind(
                            null,
                            service.id,
                            o.id,
                            !active,
                          )}
                        >
                          <Button variant="ghost" size="sm" type="submit">
                            {active ? 'Desactivar' : 'Activar'}
                          </Button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <form ref={optFormRef} action={optAction} className="space-y-3">
            <input type="hidden" name="serviceId" defaultValue={service.id} />
            <Field
              label="Nombre de la opción"
              htmlFor="optionName"
              hint="Es lo que lee el cliente al reservar. Ej.: “Corte simple”, “Corte + barba”."
            >
              <Input
                id="optionName"
                name="name"
                maxLength={80}
                placeholder="Corte simple"
                required
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Duración (min)" htmlFor="durationMinutes">
                <Input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  min={1}
                  required
                />
              </Field>
              <Field label="Precio" htmlFor="price">
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                />
              </Field>
            </div>
            <SubmitButton>Agregar opción</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
      >
        {editing && (
          <EditOptionForm
            key={editing.id}
            serviceId={service.id}
            option={editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Dialog>
    </div>
  );
}

function EditOptionForm({
  serviceId,
  option,
  onDone,
}: {
  serviceId: string;
  option: ServiceOptionView;
  onDone: () => void;
}) {
  const [state, action] = useActionState(updateOption, IDLE_STATE);
  useActionFeedback(state);
  useEffect(() => {
    if (state.status === 'success') onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar opción</DialogTitle>
      </DialogHeader>
      <form action={action} className="space-y-3">
        <input type="hidden" name="serviceId" defaultValue={serviceId} />
        <input type="hidden" name="optionId" defaultValue={option.id} />
        <Field
          label="Nombre de la opción"
          htmlFor="name"
          hint="Renombrarla no cambia los turnos ya reservados."
        >
          <Input id="name" name="name" maxLength={80} defaultValue={option.name} required />
        </Field>
        <Field label="Duración (min)" htmlFor="durationMinutes">
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={1}
            defaultValue={option.durationMinutes}
            required
          />
        </Field>
        <Field label="Precio" htmlFor="price">
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min={0}
            defaultValue={option.price}
            required
          />
        </Field>
        <SubmitButton>Guardar</SubmitButton>
      </form>
    </>
  );
}
