import { serverFetch } from './server';

export interface PlanView {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string[] | null;
  limits: Record<string, unknown> | null;
}

export const getPlans = () => serverFetch<PlanView[]>('/plans');
