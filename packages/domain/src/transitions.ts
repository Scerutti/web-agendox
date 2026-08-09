import { AppointmentStatus } from './enums';

// Acciones de staff sobre un turno (endpoints POST /appointments/:id/<action>).
export type AppointmentAction =
  | 'approve'
  | 'reject'
  | 'cancel'
  | 'complete'
  | 'noShow';

// Matriz de acciones disponibles por estado, según ADR 0001 §3.
// (Las señas se accionan sobre el Deposit, no acá.)
export const APPOINTMENT_ACTIONS: Record<
  AppointmentStatus,
  readonly AppointmentAction[]
> = {
  [AppointmentStatus.PENDING_DEPOSIT]: ['cancel'],
  [AppointmentStatus.PENDING_APPROVAL]: ['approve', 'reject', 'cancel'],
  [AppointmentStatus.CONFIRMED]: ['complete', 'cancel', 'noShow'],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.REJECTED]: [],
  [AppointmentStatus.NO_SHOW]: [],
};

export function availableActions(
  status: AppointmentStatus,
): readonly AppointmentAction[] {
  return APPOINTMENT_ACTIONS[status] ?? [];
}

export function canDo(
  status: AppointmentStatus,
  action: AppointmentAction,
): boolean {
  return availableActions(status).includes(action);
}

/** Estados terminales: no admiten más transiciones. */
export function isTerminal(status: AppointmentStatus): boolean {
  return availableActions(status).length === 0;
}
