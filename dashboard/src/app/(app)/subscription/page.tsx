import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@agendox/ui';
import { formatDateInOrgTz } from '@agendox/domain';
import { getPlans } from '@/lib/api/subscription';
import { getCurrentOrganization, getSubscriptionStatus } from '@/lib/api/session';
import { NoAccess } from '@/components/no-access';
import { SUBSCRIPTION_STATUS_UI } from '@/lib/subscription-ui';
import { PlansList } from './plans-list';

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ status }, sub] = await Promise.all([searchParams, getSubscriptionStatus()]);

  if (!sub) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Suscripción</h1>
        <NoAccess resource="la suscripción" />
      </div>
    );
  }

  const [plans, org] = await Promise.all([getPlans(), getCurrentOrganization()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Suscripción</h1>
        <p className="text-sm text-muted-foreground">
          Estado de operación y planes disponibles.
        </p>
      </div>

      {status === 'success' && (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
          Estamos procesando tu pago. El estado de la suscripción se actualiza
          automáticamente en cuanto la pasarela lo confirma.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estado actual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Puede operar: </span>
            {sub.canOperate ? 'Sí' : 'No'}
          </p>
          {sub.trial && (
            <p>
              <span className="text-muted-foreground">Prueba: </span>
              {sub.trial.active
                ? `activa, vence el ${formatDateInOrgTz(sub.trial.endsAt, org.timezone)}`
                : 'vencida'}
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Plan: </span>
            {sub.subscription
              ? `${sub.subscription.planName} (${SUBSCRIPTION_STATUS_UI[sub.subscription.status].label})`
              : 'Sin suscripción'}
          </p>
        </CardContent>
      </Card>

      <PlansList
        plans={plans}
        currentPlanId={sub.subscription?.planId ?? null}
        canCancel={
          !!sub.subscription &&
          !['CANCELLED', 'EXPIRED'].includes(sub.subscription.status)
        }
      />
    </div>
  );
}
