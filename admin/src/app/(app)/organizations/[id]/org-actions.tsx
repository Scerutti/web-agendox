'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  toast,
} from '@agendox/ui';
import {
  disableOrganization,
  reactivateOrganization,
  suspendOrganization,
} from '../actions';

export function OrgActions({
  id,
  name,
  status,
}: {
  id: string;
  name: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typedName, setTypedName] = useState('');

  async function run(task: () => Promise<{ ok: boolean; message: string }>) {
    setBusy(true);
    const res = await task();
    setBusy(false);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
    return res.ok;
  }

  const suspended = status === 'SUSPENDED';
  const disabled = status === 'DISABLED';

  return (
    <div className="flex flex-wrap gap-2">
      {!disabled && (
        <Button
          variant={suspended ? 'default' : 'secondary'}
          disabled={busy}
          onClick={() =>
            run(() => (suspended ? reactivateOrganization(id) : suspendOrganization(id)))
          }
        >
          {busy ? 'Procesando…' : suspended ? 'Reactivar' : 'Suspender'}
        </Button>
      )}

      {disabled ? (
        <Button variant="default" disabled={busy} onClick={() => run(() => reactivateOrganization(id))}>
          Reactivar
        </Button>
      ) : (
        <Button variant="destructive" disabled={busy} onClick={() => setConfirmOpen(true)}>
          Dar de baja
        </Button>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogHeader>
          <DialogTitle>Dar de baja {name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>
            El negocio deja de operar: nadie del staff puede entrar y la página pública
            de reservas deja de responder.
          </p>
          <p className="text-muted-foreground">
            Los turnos, clientes e historial <strong>no</strong> se borran — quedan
            guardados y la baja se puede revertir reactivando la organización.
          </p>
          {/* Pedir el nombre escrito evita la baja por click accidental en una
              lista donde todas las filas se parecen. */}
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
          <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={busy || typedName.trim() !== name}
            onClick={async () => {
              const ok = await run(() => disableOrganization(id));
              if (ok) {
                setConfirmOpen(false);
                setTypedName('');
              }
            }}
          >
            {busy ? 'Dando de baja…' : 'Confirmar baja'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
