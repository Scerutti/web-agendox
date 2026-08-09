import { getPendingDeposits } from '@/lib/api/deposits';
import { getAppointment } from '@/lib/api/appointments';
import { getCurrentOrganization } from '@/lib/api/session';
import { NoAccess } from '@/components/no-access';
import { DepositsList, type DepositRow } from './deposits-list';

export default async function DepositsPage() {
  const deposits = await getPendingDeposits();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Señas</h1>
        <p className="text-sm text-muted-foreground">
          Confirmá o rechazá las señas pendientes. Al confirmar, el turno pasa a
          CONFIRMED.
        </p>
      </div>
      {deposits === null ? (
        <NoAccess resource="las señas" />
      ) : (
        <DepositsContent deposits={deposits} />
      )}
    </div>
  );
}

async function DepositsContent({
  deposits,
}: {
  deposits: NonNullable<Awaited<ReturnType<typeof getPendingDeposits>>>;
}) {
  const org = await getCurrentOrganization();
  const appts = await Promise.all(
    deposits.map((d) => getAppointment(d.appointmentId)),
  );
  const rows: DepositRow[] = deposits.map((deposit, i) => ({
    deposit,
    appointment: appts[i] ?? null,
  }));

  return <DepositsList rows={rows} timezone={org.timezone} />;
}
