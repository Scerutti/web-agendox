import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@agendox/ui';
import { formatInOrgTz } from '@agendox/domain';
import { getPublicOrg } from '@/lib/api/public';
import {
  getMe,
  getMyAppointments,
  redirectIfSessionExpired,
  requireCustomerSession,
} from '@/lib/api/customer';
import { APPOINTMENT_STATUS_UI } from '@/lib/appointment-ui';
import type { CustomerAppointmentView, CustomerProfile } from '@/lib/api/customer';
import { PortalLogoutButton } from './logout-button';
import { PortalNotifications } from './portal-notifications';

export default async function PortalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Antes de cualquier fetch: sin esto la página pide los turnos igual mientras
  // el layout redirige, y el 401 se lleva puesto al redirect.
  await requireCustomerSession(slug, `/${slug}/portal`);

  const org = await getPublicOrg(slug);
  if (!org) notFound();

  let me: CustomerProfile | null;
  let appointments: CustomerAppointmentView[];
  try {
    [me, appointments] = await Promise.all([getMe(slug), getMyAppointments(slug)]);
  } catch (e) {
    redirectIfSessionExpired(e, slug, `/${slug}/portal`);
    throw e;
  }

  const now = Date.now();
  const upcoming = appointments
    .filter((a) => new Date(a.startsAt).getTime() >= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = appointments
    .filter((a) => new Date(a.startsAt).getTime() < now)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Mis turnos</h1>
          {me ? (
            <p className="text-sm text-muted-foreground">
              {me.firstName} {me.lastName} · {me.email}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <PortalNotifications slug={slug} />
          <PortalLogoutButton slug={slug} />
        </div>
      </div>

      <Section title="Próximos" items={upcoming} slug={slug} tz={org.timezone} />
      <Section title="Historial" items={past} slug={slug} tz={org.timezone} />

      <Link href={`/${slug}`} className="text-sm text-primary hover:underline">
        ← Reservar otro turno
      </Link>
    </div>
  );
}

function Section({
  title,
  items,
  slug,
  tz,
}: {
  title: string;
  items: CustomerAppointmentView[];
  slug: string;
  tz: string;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nada por acá.</p>
      ) : (
        items.map((a) => {
          const ui = APPOINTMENT_STATUS_UI[a.status];
          return (
            <Link
              key={a.id}
              href={`/${slug}/portal/${a.id}`}
              className="block rounded-lg border p-3 hover:bg-accent"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{a.serviceName}</span>
                <Badge variant={ui.variant}>{ui.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {a.serviceOptionName} · {formatInOrgTz(a.startsAt, tz)} ·{' '}
                {a.resourceName}
              </p>
            </Link>
          );
        })
      )}
    </div>
  );
}
