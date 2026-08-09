import type { BlockedTimeType } from '@agendox/domain';
import type { BadgeProps } from '@agendox/ui';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export const BLOCKED_TIME_TYPE_UI: Record<
  BlockedTimeType,
  { label: string; variant: BadgeVariant }
> = {
  VACATION: { label: 'Vacaciones', variant: 'secondary' },
  LICENSE: { label: 'Licencia', variant: 'secondary' },
  MAINTENANCE: { label: 'Mantenimiento', variant: 'secondary' },
  MANUAL: { label: 'Manual', variant: 'muted' },
};
