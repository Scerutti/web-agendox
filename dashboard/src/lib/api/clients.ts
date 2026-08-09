import { tryServerFetch } from './server';
import type { ClientStatus } from '@agendox/domain';

export interface ClientView {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  phone: string | null;
  notes: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPage {
  items: ClientView[];
  total: number;
}

export function getClients(
  params: { q?: string; limit?: number; offset?: number } = {},
): Promise<ClientPage | null> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.offset != null) qs.set('offset', String(params.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return tryServerFetch<ClientPage>(`/clients${suffix}`);
}
