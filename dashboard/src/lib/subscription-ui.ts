import type { SubscriptionStatus } from '@agendox/domain';
import type { BadgeProps } from '@agendox/ui';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export const SUBSCRIPTION_STATUS_UI: Record<
  SubscriptionStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: 'Pendiente de pago', variant: 'muted' },
  ACTIVE: { label: 'Activa', variant: 'success' },
  PAST_DUE: { label: 'Pago vencido', variant: 'destructive' },
  SUSPENDED: { label: 'Suspendida', variant: 'destructive' },
  CANCELLED: { label: 'Cancelada', variant: 'muted' },
  EXPIRED: { label: 'Vencida', variant: 'muted' },
};

const BILLING_PERIOD_LABEL: Record<string, string> = {
  MONTHLY: 'Mensual',
  YEARLY: 'Anual',
  ANNUAL: 'Anual',
};

/** El backend puede mandar el período en distintos casings (MONTHLY, monthly, ANNUAL). */
export function billingPeriodLabel(period: string): string {
  return BILLING_PERIOD_LABEL[period.toUpperCase()] ?? period;
}
