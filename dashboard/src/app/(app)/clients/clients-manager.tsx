'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@agendox/ui';
import { ClientForm } from './client-form';
import { setClientStatus } from './actions';
import type { ClientView } from '@/lib/api/clients';

export function ClientsManager({
  clients,
  total,
  q,
  pageNum,
  pageSize,
}: {
  clients: ClientView[];
  total: number;
  q: string;
  pageNum: number;
  pageSize: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<ClientView | null>(null);

  const from = total === 0 ? 0 : (pageNum - 1) * pageSize + 1;
  const to = Math.min(pageNum * pageSize, total);
  const hasPrev = pageNum > 1;
  const hasNext = pageNum * pageSize < total;
  const emptyMessage = q
    ? 'Sin resultados para la búsqueda.'
    : 'Sin clientes todavía.';

  function go(params: { q?: string; page?: number }) {
    const sp = new URLSearchParams();
    const query = params.q !== undefined ? params.q : q;
    const page = params.page !== undefined ? params.page : pageNum;
    if (query) sp.set('q', query);
    if (page > 1) sp.set('page', String(page));
    router.push(`/clients${sp.toString() ? `?${sp.toString()}` : ''}`);
  }

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get('q');
    go({ q: typeof value === 'string' ? value : '', page: 1 });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm mode="create" />
        </CardContent>
      </Card>

      {/* El input a ancho completo en mobile: con `w-72` fijo empujaba a los
          botones fuera de la pantalla. */}
      <form onSubmit={onSearch} className="flex flex-wrap items-center gap-2">
        <Input
          name="q"
          placeholder="Buscar por nombre, email o WhatsApp…"
          defaultValue={q}
          className="w-full sm:w-72"
        />
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
        {q && (
          <Button type="button" variant="ghost" size="sm" onClick={() => go({ q: '', page: 1 })}>
            Limpiar
          </Button>
        )}
      </form>

      {/*
        Dos lecturas de los mismos datos, elegidas por CSS. La tabla tiene cuatro
        columnas y no entra en un teléfono: el `overflow-x-auto` no lo resolvía,
        solo escondía el desborde detrás de un scroll lateral que nadie descubre.
      */}
      <div className="space-y-3 sm:hidden">
        {clients.length === 0 ? (
          <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          clients.map((c) => {
            const active = c.status === 'ACTIVE';
            return (
              <div key={c.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {c.firstName} {c.lastName}
                    </p>
                    {c.email ? (
                      <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                    ) : null}
                  </div>
                  <Badge variant={active ? 'success' : 'muted'}>
                    {active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {c.whatsapp}
                  {c.phone ? ` · ${c.phone}` : ''}
                </p>
                <div className="flex flex-wrap gap-2 border-t pt-3">
                  <ClientActions client={c} onEdit={() => setEditing(c)} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3 font-medium">Cliente</th>
              <th className="p-3 font-medium">Contacto</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {clients.map((c) => {
              const active = c.status === 'ACTIVE';
              return (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="font-medium">
                      {c.firstName} {c.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.email}
                    </div>
                  </td>
                  <td className="p-3">
                    {c.whatsapp}
                    {c.phone ? ` · ${c.phone}` : ''}
                  </td>
                  <td className="p-3">
                    <Badge variant={active ? 'success' : 'muted'}>
                      {active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    <ClientActions client={c} onEdit={() => setEditing(c)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {total === 0 ? 'Sin clientes' : `${from}–${to} de ${total}`}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            onClick={() => go({ page: pageNum - 1 })}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() => go({ page: pageNum + 1 })}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <Dialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
      >
        {editing && (
          <>
            <DialogHeader>
              <DialogTitle>Editar cliente</DialogTitle>
            </DialogHeader>
            <ClientForm
              mode="edit"
              client={editing}
              key={editing.id}
              onSuccess={() => setEditing(null)}
            />
          </>
        )}
      </Dialog>
    </div>
  );
}

/** Acciones por cliente. Compartidas por la tarjeta de mobile y la fila de la tabla. */
function ClientActions({
  client,
  onEdit,
}: {
  client: ClientView;
  onEdit: () => void;
}) {
  const active = client.status === 'ACTIVE';
  return (
    <>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        Editar
      </Button>
      <form
        className="inline"
        action={setClientStatus.bind(null, client.id, active ? 'INACTIVE' : 'ACTIVE')}
      >
        <Button variant="ghost" size="sm" type="submit">
          {active ? 'Desactivar' : 'Activar'}
        </Button>
      </form>
    </>
  );
}
