import { serverFetch, tryServerFetch } from './server';
import type { AppointmentSource, AppointmentStatus } from '@agendox/domain';

export interface AppointmentView {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceOptionId: string;
  durationMinutes: number;
  servicePrice: number;
  resourceId: string;
  resourceName: string;
  clientId: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  startsAt: string;
  endsAt: string;
  depositAmount: number | null;
  remainingAmount: number | null;
  status: AppointmentStatus;
  source: AppointmentSource;
  notes: string | null;
  cancellationReason: string | null;
}

export interface AppointmentsQuery {
  from: string;
  to: string;
  resourceId?: string;
  status?: AppointmentStatus;
}

export function getAppointments(q: AppointmentsQuery) {
  const params = new URLSearchParams({ from: q.from, to: q.to });
  if (q.resourceId) params.set('resourceId', q.resourceId);
  if (q.status) params.set('status', q.status);
  return serverFetch<AppointmentView[]>(`/appointments?${params.toString()}`);
}

export const getAppointment = (id: string) =>
  tryServerFetch<AppointmentView>(`/appointments/${id}`);
