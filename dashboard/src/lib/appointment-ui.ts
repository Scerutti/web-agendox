import type { AppointmentStatus } from '@agendox/domain';
import type { BadgeProps } from '@agendox/ui';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export const APPOINTMENT_STATUS_UI: Record<
  AppointmentStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING_DEPOSIT: { label: 'Seña pendiente', variant: 'secondary' },
  PENDING_APPROVAL: { label: 'Por aprobar', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmado', variant: 'success' },
  COMPLETED: { label: 'Completado', variant: 'muted' },
  CANCELLED: { label: 'Cancelado', variant: 'muted' },
  REJECTED: { label: 'Rechazado', variant: 'destructive' },
  NO_SHOW: { label: 'No asistió', variant: 'destructive' },
};

export const APPOINTMENT_ACTION_LABEL: Record<string, string> = {
  approve: 'Aprobar',
  reject: 'Rechazar',
  cancel: 'Cancelar',
  complete: 'Completar',
  noShow: 'No asistió',
};
