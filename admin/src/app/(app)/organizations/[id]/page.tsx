import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, CardContent, CardHeader, CardTitle, buttonVariants } from '@agendox/ui';
import { ApiError } from '@/lib/api/server';
import {
  getOrganization,
  ORG_STATUS_UI,
  SUBSCRIPTION_STATUS_LABEL,
  type AdminOrgDetail,
} from '@/lib/api/admin';
import { OrgActions } from './org-actions';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let org: AdminOrgDetail;
  try {
    org = await getOrganization(id);
  } catch (e) {
    if (e instanceof ApiError && e.isNotFound) notFound();
    throw e;
  }

  const ui = ORG_STATUS_UI[org.status] ?? { label: org.status, variant: 'muted' as const };
  const fmt = (d: string) => new Date(d).toLocaleString('es-AR');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{org.name}</h1>
          <Badge variant={ui.variant}>{ui.label}</Badge>
        </div>
        <Link
          href="/organizations"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          ← Volver
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Slug" value={`/${org.slug}`} />
          <Row label="Zona horaria" value={org.timezone} />
          <Row label="Owner" value={org.ownerEmail ?? '—'} />
          <Row label="Alta" value={fmt(org.createdAt)} />
          <Row label="Usuarios" value={String(org.counts.users)} />
          <Row label="Turnos" value={String(org.counts.appointments)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan y suscripción</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row
            label="Suscripción"
            value={
              org.subscriptionStatus
                ? (SUBSCRIPTION_STATUS_LABEL[org.subscriptionStatus] ?? org.subscriptionStatus)
                : 'Sin suscripción'
            }
          />
          <Row label="Plan" value={org.planName ?? '—'} />
          <Row
            label="Período vigente hasta"
            value={org.currentPeriodEnd ? fmt(org.currentPeriodEnd) : '—'}
          />
          <Row
            label="Prueba"
            value={org.trial ? `${org.trial.status} · vence ${fmt(org.trial.endsAt)}` : '—'}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {org.status === 'SUSPENDED'
              ? 'La organización está suspendida y no puede operar. Reactivala para restaurar el acceso.'
              : 'Suspender bloquea la operación del negocio (staff y reservas públicas) hasta reactivarla.'}
          </p>
          <OrgActions id={org.id} status={org.status} />
        </CardContent>
      </Card>
    </div>
  );
}
