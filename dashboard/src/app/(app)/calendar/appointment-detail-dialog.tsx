'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Dialog,
  DialogHeader,
  DialogTitle,
  Textarea,
  toast,
} from '@agendox/ui';
import {
  availableActions,
  formatInOrgTz,
  formatMoney,
  type AppointmentAction,
} from '@agendox/domain';
import {
  APPOINTMENT_ACTION_LABEL,
  APPOINTMENT_STATUS_UI,
} from '@/lib/appointment-ui';
import { runAppointmentAction } from './actions';
import type { AppointmentView } from '@/lib/api/appointments';

export function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  timezone,
}: {
  appointment: AppointmentView | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  timezone: string;
}) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  // Sin turno no hay nada que mostrar: un <Dialog> sin children abierto seria un
  // modal vacio.
  if (!appointment) return null;

  const actions = availableActions(appointment.status);
  const ui = APPOINTMENT_STATUS_UI[appointment.status];

  async function run(action: AppointmentAction) {
    setBusy(true);
    const res = await runAppointmentAction(appointment!.id, action, reason || undefined);
    setBusy(false);
    if (res.ok) {
      toast.success(res.message);
      onOpenChange(false);
      setReason('');
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  const showReason = actions.includes('reject') || actions.includes('cancel');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {appointment.serviceName}
          <Badge variant={ui.variant}>{ui.label}</Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-2 text-sm">
        {/* El nombre de la opción sale del snapshot del turno, no del catálogo:
            si el negocio la renombró después, acá se sigue viendo lo que el
            cliente contrató. */}
        <p>
          <span className="text-muted-foreground">Opción: </span>
          {appointment.serviceOptionName} · {appointment.durationMinutes} min
        </p>
        <p>
          <span className="text-muted-foreground">Cuándo: </span>
          {formatInOrgTz(appointment.startsAt, timezone)} –{' '}
          {formatInOrgTz(appointment.endsAt, timezone, { timeStyle: 'short', dateStyle: undefined })}
        </p>
        <p>
          <span className="text-muted-foreground">Recurso: </span>
          {appointment.resourceName}
        </p>
        <p>
          <span className="text-muted-foreground">Cliente: </span>
          {appointment.clientName}
          {appointment.clientPhone ? ` · ${appointment.clientPhone}` : ''}
        </p>
        <p>
          <span className="text-muted-foreground">Precio: </span>
          {formatMoney(appointment.servicePrice)}
          {appointment.depositAmount != null
            ? ` · seña ${formatMoney(appointment.depositAmount)}`
            : ''}
        </p>
        {appointment.notes ? (
          <p>
            <span className="text-muted-foreground">Notas: </span>
            {appointment.notes}
          </p>
        ) : null}
        {appointment.cancellationReason ? (
          <p>
            <span className="text-muted-foreground">Motivo: </span>
            {appointment.cancellationReason}
          </p>
        ) : null}
      </div>

      {actions.length > 0 ? (
        <div className="mt-4 space-y-3 border-t pt-4">
          {showReason && (
            <Textarea
              placeholder="Motivo (opcional, para rechazar/cancelar)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action}
                variant={
                  action === 'reject' || action === 'cancel'
                    ? 'destructive'
                    : action === 'complete' || action === 'approve'
                      ? 'default'
                      : 'outline'
                }
                size="sm"
                disabled={busy}
                onClick={() => run(action)}
              >
                {APPOINTMENT_ACTION_LABEL[action]}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
          Sin acciones disponibles para este estado.
        </p>
      )}
    </Dialog>
  );
}
