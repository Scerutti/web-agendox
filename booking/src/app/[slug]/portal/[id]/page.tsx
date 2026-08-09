import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@agendox/ui';
import { formatInOrgTz, formatMoney } from '@agendox/domain';
import { getPublicOrg } from '@/lib/api/public';
import { getMyAppointment } from '@/lib/api/customer';
import { APPOINTMENT_STATUS_UI } from '@/lib/appointment-ui';

export default async function PortalAppointmentPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const org = await getPublicOrg(slug);
  if (!org) notFound();

  const appointment = await getMyAppointment(slug, id).catch(() => null);
  if (!appointment) notFound();

  const ui = APPOINTMENT_STATUS_UI[appointment.status];

  return (
    <div className="space-y-4">
      <Link
        href={`/${slug}/portal`}
        className="text-sm text-primary hover:underline"
      >
        ← Volver
      </Link>

      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight">
          {appointment.serviceName}
        </h1>
        <Badge variant={ui.variant}>{ui.label}</Badge>
      </div>

      <div className="space-y-1 rounded-lg border p-4 text-sm">
        <p>
          <span className="text-muted-foreground">Cuándo: </span>
          {formatInOrgTz(appointment.startsAt, org.timezone)}
        </p>
        <p>
          <span className="text-muted-foreground">Recurso: </span>
          {appointment.resourceName}
        </p>
        <p>
          <span className="text-muted-foreground">Precio: </span>
          {formatMoney(appointment.servicePrice)}
        </p>
      </div>

      {appointment.transfer && (
        <div className="space-y-1 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium">Datos para la seña</p>
          <p>Seña: {formatMoney(appointment.transfer.depositAmount)}</p>
          {appointment.transfer.bankName && (
            <p>Banco: {appointment.transfer.bankName}</p>
          )}
          {appointment.transfer.accountHolder && (
            <p>Titular: {appointment.transfer.accountHolder}</p>
          )}
          {appointment.transfer.alias && (
            <p>Alias: {appointment.transfer.alias}</p>
          )}
          {appointment.transfer.cbu && <p>CBU: {appointment.transfer.cbu}</p>}
          {appointment.transfer.instructions && (
            <p className="text-muted-foreground">
              {appointment.transfer.instructions}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
