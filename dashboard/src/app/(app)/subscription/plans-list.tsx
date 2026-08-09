'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  toast,
} from '@agendox/ui';
import { formatMoney } from '@agendox/domain';
import { billingPeriodLabel } from '@/lib/subscription-ui';
import { cancelSubscription, startCheckout } from './actions';
import type { PlanView } from '@/lib/api/subscription';

export function PlansList({
  plans,
  currentPlanId,
  canCancel,
}: {
  plans: PlanView[];
  currentPlanId: string | null;
  canCancel: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function subscribe(planId: string) {
    setBusyId(planId);
    const res = await startCheckout(planId);
    if (res.ok && res.initPoint) {
      // Checkout externo (pasarela): redirigimos el navegador.
      window.location.href = res.initPoint;
      return;
    }
    setBusyId(null);
    toast.error(res.message);
  }

  async function cancel() {
    setCancelling(true);
    const res = await cancelSubscription();
    setCancelling(false);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlanId;
        return (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {isCurrent && <Badge variant="success">Actual</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-semibold">
                {formatMoney(plan.price, plan.currency)}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}
                  / {billingPeriodLabel(plan.billingPeriod)}
                </span>
              </p>
              {plan.features && plan.features.length > 0 && (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {plan.features.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              )}
              {isCurrent && canCancel ? (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={cancelling}
                  onClick={cancel}
                >
                  {cancelling ? 'Cancelando…' : 'Cancelar suscripción'}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={busyId !== null || isCurrent}
                  onClick={() => subscribe(plan.id)}
                >
                  {isCurrent
                    ? 'Plan actual'
                    : busyId === plan.id
                      ? 'Redirigiendo…'
                      : 'Suscribirme'}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
