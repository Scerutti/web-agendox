import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@agendox/ui';
import {
  getCurrentOrganization,
  getSession,
  getSubscriptionStatus,
} from '@/lib/api/session';
import { ROLE_LABEL, orgStatusLabel } from '@/lib/org-ui';
import { publicBookingUrl } from '@/lib/public-booking';
import { PublicBookingLink } from '@/components/public-booking-link';

export default async function OverviewPage() {
  const session = await getSession();
  const [orgResult, subResult] = await Promise.allSettled([
    getCurrentOrganization(),
    getSubscriptionStatus(),
  ]);
  const org = orgResult.status === 'fulfilled' ? orgResult.value : null;
  const sub = subResult.status === 'fulfilled' ? subResult.value : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inicio</h1>
        <p className="text-sm text-muted-foreground">
          Sesión iniciada como {session?.email} (
          {session ? ROLE_LABEL[session.role] : '—'}).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organización</CardTitle>
            <CardDescription>Datos de tu negocio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Nombre: </span>
              {org?.name ?? '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Slug público: </span>
              {org?.slug ?? '—'}
            </p>
            {/* El slug solo no le sirve a nadie: lo que el dueño necesita a
                mano es el link entero para mandárselo al cliente. */}
            <div className="space-y-1 pt-1">
              <p className="text-muted-foreground">
                Link público para solicitar turnos
              </p>
              {org?.slug ? (
                <PublicBookingLink url={publicBookingUrl(org.slug)} />
              ) : (
                <p>—</p>
              )}
            </div>
            <p className="pt-1">
              <span className="text-muted-foreground">Zona horaria: </span>
              {org?.timezone ?? '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Estado: </span>
              {org ? orgStatusLabel(org.status) : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suscripción</CardTitle>
            <CardDescription>Estado de operación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {sub ? (
              <>
                <p>
                  <span className="text-muted-foreground">Puede operar: </span>
                  {sub.canOperate ? 'Sí' : 'No'}
                </p>
                <p>
                  <span className="text-muted-foreground">Trial: </span>
                  {sub.trial?.active ? 'Activo' : 'No activo'}
                </p>
                <p>
                  <span className="text-muted-foreground">Plan: </span>
                  {sub.subscription?.planName ?? 'Sin suscripción'}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                No disponible para tu rol.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        Desde el menú podés gestionar tu calendario, clientes, servicios,
        recursos y la configuración de tu negocio.
      </p>
    </div>
  );
}
