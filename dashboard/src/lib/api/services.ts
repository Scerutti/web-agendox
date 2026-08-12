import { serverFetch, tryServerFetch } from './server';

export interface ServiceView {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface ServiceOptionView {
  id: string;
  serviceId: string;
  /** Qué es la opción ("Corte simple"). Obligatorio. */
  name: string;
  durationMinutes: number;
  price: number;
  active: boolean;
}

export interface ServiceDetailView extends ServiceView {
  options: ServiceOptionView[];
}

export const getServices = () => serverFetch<ServiceView[]>('/services');
export const getService = (id: string) =>
  tryServerFetch<ServiceDetailView>(`/services/${id}`);
