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

      <form onSubmit={onSearch} className="flex items-center gap-2">
        <Input
          name="q"
          placeholder="Buscar por nombre, email o WhatsApp…"
          defaultValue={q}
          className="w-72 max-w-full"
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

      <div className="overflow-x-auto rounded-lg border">
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
                  {q ? 'Sin resultados para la búsqueda.' : 'Sin clientes todavía.'}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(c)}
                    >
                      Editar
                    </Button>
                    <form
                      className="inline"
                      action={setClientStatus.bind(
                        null,
                        c.id,
                        active ? 'INACTIVE' : 'ACTIVE',
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
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
