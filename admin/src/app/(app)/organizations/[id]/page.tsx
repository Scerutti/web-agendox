import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, CardContent, CardHeader, CardTitle, buttonVariants } from '@agendox/ui';
import { ApiError } from '@/lib/api/server';
import {
  getOrganization,
  getOrganizationUsers,
  ORG_STATUS_UI,
  SUBSCRIPTION_STATUS_LABEL,
  type AdminOrgDetail,
  type AdminOrgUser,
} from '@/lib/api/admin';
import { OrgActions } from './org-actions';
import { OrgFeaturesForm } from './org-features-form';
import { OrgProfileForm } from './org-profile-form';
import { OrgUsers } from './org-users';
import { OwnerEmailForm } from './owner-email-form';

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

  // El staff no rompe la ficha si falla: la organización se sigue viendo.
  let users: AdminOrgUser[] = [];
  try {
    users = await getOrganizationUsers(id);
  } catch {
    users = [];
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
          <CardTitle>Términos y Condiciones</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row
            label="Estado"
            value={
              org.terms.requiresAcceptance
                ? org.terms.acceptedVersion
                  ? 'Pendiente (aceptó una versión anterior)'
                  : 'Pendiente (nunca aceptó)'
                : 'Aceptados'
            }
          />
          <Row label="Versión aceptada" value={org.terms.acceptedVersion ?? '—'} />
          <Row label="Versión vigente" value={org.terms.currentVersion} />
          <Row
            label="Fecha de aceptación"
            value={org.terms.acceptedAt ? fmt(org.terms.acceptedAt) : '—'}
          />
          <Row
            label="Aceptó"
            value={
              org.terms.acceptedByEmail ??
              (org.terms.acceptedByUserId ? 'Usuario dado de baja' : '—')
            }
          />
          {org.terms.requiresAcceptance ? (
            <p className="pt-3 text-muted-foreground">
              El dueño ve el pedido de aceptación al entrar al panel. La plataforma no
              puede aceptar en su nombre.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editar datos</CardTitle>
        </CardHeader>
        <CardContent>
          <OrgProfileForm id={org.id} name={org.name} timezone={org.timezone} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuario dueño</CardTitle>
        </CardHeader>
        <CardContent>
          <OwnerEmailForm id={org.id} ownerEmail={org.ownerEmail} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipo del negocio</CardTitle>
        </CardHeader>
        <CardContent>
          <OrgUsers id={org.id} users={users} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades habilitadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Definen qué ve habilitado el negocio en su panel. Los cambios se guardan al
            instante.
          </p>
          <OrgFeaturesForm id={org.id} features={org.features} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado de la cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {org.status === 'SUSPENDED'
              ? 'La organización está suspendida y no puede operar. Reactivala para restaurar el acceso.'
              : org.status === 'DISABLED'
                ? 'La organización está dada de baja. Los datos siguen guardados; reactivarla restaura el acceso. Si ya no va más, podés eliminarla definitivamente: eso sí borra todo y libera el slug y el email del dueño.'
                : 'Suspender bloquea la operación del negocio (staff y reservas públicas) de forma temporal. Dar de baja lo cierra, conservando los datos.'}
          </p>
          <OrgActions id={org.id} name={org.name} slug={org.slug} status={org.status} />
        </CardContent>
      </Card>
    </div>
  );
}
