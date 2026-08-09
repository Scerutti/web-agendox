'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, toast } from '@agendox/ui';
import { formatInOrgTz, formatMoney } from '@agendox/domain';
import { confirmDeposit, rejectDeposit } from './actions';
import { DEPOSIT_STATUS_UI } from '@/lib/deposit-ui';
import type { DepositView } from '@/lib/api/deposits';
import type { AppointmentView } from '@/lib/api/appointments';

export interface DepositRow {
  deposit: DepositView;
  appointment: AppointmentView | null;
}

export function DepositsList({
  rows,
  timezone,
}: {
  rows: DepositRow[];
  timezone: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function act(id: string, op: 'confirm' | 'reject') {
    setBusyId(id);
    const res = await (op === 'confirm' ? confirmDeposit(id) : rejectDeposit(id));
    setBusyId(null);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
        No hay señas pendientes.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map(({ deposit, appointment }) => (
        <div
          key={deposit.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
        >
          <div className="text-sm">
            <div className="font-medium">
              {appointment
                ? `${appointment.clientName} · ${appointment.serviceName}`
                : `Turno ${deposit.appointmentId.slice(0, 8)}…`}
            </div>
            <div className="text-muted-foreground">
              {appointment
                ? `${formatInOrgTz(appointment.startsAt, timezone)} · `
                : ''}
              Seña esperada {formatMoney(deposit.expectedAmount)}
            </div>
            <div className="text-xs text-muted-foreground">
              Solicitada {formatInOrgTz(deposit.requestedAt, timezone)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={DEPOSIT_STATUS_UI[deposit.status].variant}>
              {DEPOSIT_STATUS_UI[deposit.status].label}
            </Badge>
            <Button
              size="sm"
              disabled={busyId === deposit.id}
              onClick={() => act(deposit.id, 'confirm')}
            >
              Confirmar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={busyId === deposit.id}
              onClick={() => act(deposit.id, 'reject')}
            >
              Rechazar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
