import { formatDateInOrgTz } from '@agendox/domain';
import type { SubscriptionInfo } from '@/lib/api/types';

export function TrialBanner({
  sub,
  timezone,
}: {
  sub: SubscriptionInfo | null;
  timezone: string;
}) {
  if (!sub) return null;

  if (!sub.canOperate) {
    return (
      <div className="border-b bg-destructive/10 px-6 py-2 text-sm text-destructive">
        La operación está bloqueada: el período de prueba venció o no hay una
        suscripción activa. Activá un plan para seguir creando turnos.
      </div>
    );
  }

  if (sub.trial?.active) {
    return (
      <div className="border-b bg-amber-500/10 px-6 py-2 text-sm text-amber-700 dark:text-amber-400">
        Período de prueba activo · vence el{' '}
        {formatDateInOrgTz(sub.trial.endsAt, timezone)}.
      </div>
    );
  }

  // Suscripción activa y operativo: sin banner.
  return null;
}
