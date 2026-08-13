import type { AppointmentStatus } from '@agendox/domain';
import type { BadgeProps } from '@agendox/ui';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export const APPOINTMENT_STATUS_UI: Record<
  AppointmentStatus,
  {
    label: string;
    /**
     * Versión corta para lugares sin ancho: el bloque del calendario mide poco
     * más de lo que ocupa un nombre de servicio, y ahí "Seña pendiente" entraba
     * cortado a la mitad.
     */
    short: string;
    variant: BadgeVariant;
    /** Punto de color: es lo único que entra en un bloque de media hora. */
    dot: string;
  }
> = {
  PENDING_DEPOSIT: {
    label: 'Seña pendiente',
    short: 'Seña',
    variant: 'secondary',
    dot: 'bg-amber-500',
  },
  PENDING_APPROVAL: {
    label: 'Por aprobar',
    short: 'Aprobar',
    variant: 'secondary',
    dot: 'bg-sky-500',
  },
  CONFIRMED: {
    label: 'Confirmado',
    short: 'Confirmado',
    variant: 'success',
    dot: 'bg-green-500',
  },
  COMPLETED: {
    label: 'Completado',
    short: 'Completado',
    variant: 'muted',
    dot: 'bg-slate-400',
  },
  CANCELLED: {
    label: 'Cancelado',
    short: 'Cancelado',
    variant: 'muted',
    dot: 'bg-slate-400',
  },
  REJECTED: {
    label: 'Rechazado',
    short: 'Rechazado',
    variant: 'destructive',
    dot: 'bg-red-500',
  },
  NO_SHOW: {
    label: 'No asistió',
    short: 'No asistió',
    variant: 'destructive',
    dot: 'bg-red-500',
  },
};

export const APPOINTMENT_ACTION_LABEL: Record<string, string> = {
  approve: 'Aprobar',
  reject: 'Rechazar',
  cancel: 'Cancelar',
  complete: 'Completar',
  noShow: 'No asistió',
};
