import { serverFetch } from './server';

export interface AdminMetrics {
  organizations: {
    total: number;
    trial: number;
    active: number;
    suspended: number;
    disabled: number;
  };
  activeSubscriptions: number;
  activeTrials: number;
  totalAppointments: number;
}

export interface AdminOrgListItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  createdAt: string;
  subscriptionStatus: string | null;
  planName: string | null;
}

export interface AdminOrgDetail extends AdminOrgListItem {
  ownerEmail: string | null;
  currentPeriodEnd: string | null;
  trial: { status: string; endsAt: string } | null;
  counts: { users: number; appointments: number };
}

export interface SuperAdminMe {
  superAdminId: string;
  email: string;
}

export const getMe = () => serverFetch<SuperAdminMe>('/admin/me');
export const getMetrics = () => serverFetch<AdminMetrics>('/admin/metrics');

export function getOrganizations(params: {
  status?: string;
  q?: string;
}): Promise<AdminOrgListItem[]> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.q) qs.set('q', params.q);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return serverFetch<AdminOrgListItem[]>(`/admin/organizations${suffix}`);
}

export const getOrganization = (id: string) =>
  serverFetch<AdminOrgDetail>(`/admin/organizations/${id}`);

/** UI labels + badge variants for organization status. */
export const ORG_STATUS_UI: Record<string, { label: string; variant: 'success' | 'muted' | 'destructive' }> = {
  TRIAL: { label: 'Prueba', variant: 'muted' },
  ACTIVE: { label: 'Activa', variant: 'success' },
  SUSPENDED: { label: 'Suspendida', variant: 'destructive' },
  DISABLED: { label: 'Deshabilitada', variant: 'muted' },
};

export const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente de pago',
  ACTIVE: 'Activa',
  PAST_DUE: 'Pago vencido',
  SUSPENDED: 'Suspendida',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Vencida',
};
