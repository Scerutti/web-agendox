import { tryServerFetch } from './server';
import type { DepositStatus } from '@agendox/domain';

export interface DepositView {
  id: string;
  appointmentId: string;
  expectedAmount: number;
  receivedAmount: number | null;
  status: DepositStatus;
  requestedAt: string;
  confirmedAt: string | null;
  confirmedBy: string | null;
}

export const getPendingDeposits = () =>
  tryServerFetch<DepositView[]>('/deposits/pending');
