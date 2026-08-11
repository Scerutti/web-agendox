import { formatDateInOrgTz } from '@agendox/domain';
import type { OrganizationFeatures, SubscriptionInfo } from '@/lib/api/types';

export function TrialBanner({
  sub,
  timezone,
  features,
}: {
  sub: SubscriptionInfo | null;
  timezone: string;
  features: OrganizationFeatures;
}) {
  if (!sub) return null;

  if (!sub.canOperate) {
    return (
      <div className="border-b bg-destructive/10 px-6 py-2 text-sm text-destructive">
        {features.subscriptionsEnabled
          ? 'La operación está bloqueada: el período de prueba venció o no hay una suscripción activa. Activá un plan para seguir creando turnos.'
          : // En una cuenta sin suscripciones no hay ningún plan que el negocio
            // pueda activar por su cuenta: mandarlo a "activá un plan" sería
            // pedirle algo que no puede hacer.
            'La operación está bloqueada. Escribinos para reactivar tu cuenta.'}
      </div>
    );
  }

  // Con una suscripción activa el trial es irrelevante, incluso si sus 30 días
  // todavía no vencieron (pasa cuando la plataforma otorga el plan en el alta).
  if (sub.subscription?.status === 'ACTIVE') return null;

  if (sub.trial?.active) {
    return (
      <div className="border-b bg-amber-500/10 px-6 py-2 text-sm text-amber-700 dark:text-amber-400">
        Período de prueba activo · vence el{' '}
        {formatDateInOrgTz(sub.trial.endsAt, timezone)}.
      </div>
    );
  }

  return null;
}
