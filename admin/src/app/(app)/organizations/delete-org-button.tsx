'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Dialog, DialogFooter, DialogHeader, DialogTitle, Input, toast } from '@agendox/ui';
import { deleteOrganizationPermanently } from './actions';

/**
 * Borrado definitivo de una organización dada de baja.
 *
 * Se muestra sólo en filas `DISABLED`: el borrado físico es el segundo paso de
 * la baja, no un atajo. Como no hay undo, pide escribir el nombre igual que la
 * baja lógica — pero acá el texto no promete que se pueda revertir.
 */
export function DeleteOrgButton({
  id,
  name,
  slug,
  redirectToList = false,
  size = 'sm',
}: {
  id: string;
  name: string;
  slug: string;
  /** Desde el detalle hay que salir: la página deja de existir tras el borrado. */
  redirectToList?: boolean;
  size?: 'sm' | 'default';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [typedName, setTypedName] = useState('');

  async function runDelete() {
    setBusy(true);
    const res = await deleteOrganizationPermanently(id);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    setOpen(false);
    setTypedName('');
    if (redirectToList) router.push('/organizations');
    else router.refresh();
  }

  return (
    <>
      <Button variant="destructive" size={size} disabled={busy} onClick={() => setOpen(true)}>
        Eliminar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Eliminar {name} definitivamente</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>
            Se borran de la base <strong>todos</strong> los datos del negocio: turnos,
            clientes, servicios, recursos, usuarios, configuración y facturación.
          </p>
          <p className="text-muted-foreground">
            Esto <strong>no se puede deshacer</strong> y la cuenta desaparece de la tabla.
            Si sólo querés que deje de operar, alcanza con dejarla dada de baja.
          </p>
          <p className="text-muted-foreground">
            A cambio libera el slug <strong>/{slug}</strong> y el email del dueño, que
            mientras la cuenta existe quedan ocupados en toda la plataforma.
          </p>
          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">
              Escribí <strong>{name}</strong> para confirmar:
            </span>
            <Input
              value={typedName}
              onChange={(event) => setTypedName(event.target.value)}
              autoComplete="off"
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={busy || typedName.trim() !== name}
            onClick={runDelete}
          >
            {busy ? 'Eliminando…' : 'Eliminar definitivamente'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
