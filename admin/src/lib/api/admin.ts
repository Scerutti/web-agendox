import { serverFetch } from './server';
import type {
  AdminMetrics,
  AdminOrgDetail,
  AdminOrgListItem,
  PlanView,
  SuperAdminMe,
} from './admin.types';

// Los tipos y el copy de presentación viven en `admin.types.ts` para que los
// componentes cliente los puedan importar sin arrastrar `next/headers`.
export * from './admin.types';

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

/** Planes activos, para elegir uno al dar de alta un negocio ya suscripto. */
export const getPlans = () => serverFetch<PlanView[]>('/admin/plans');
