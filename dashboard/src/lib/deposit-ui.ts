import type { DepositStatus } from '@agendox/domain';
import type { BadgeProps } from '@agendox/ui';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export const DEPOSIT_STATUS_UI: Record<
  DepositStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: 'Pendiente', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmada', variant: 'success' },
  REJECTED: { label: 'Rechazada', variant: 'destructive' },
  EXPIRED: { label: 'Vencida', variant: 'muted' },
};
