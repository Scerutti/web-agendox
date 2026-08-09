import { zonedDayKey } from '@agendox/domain';
import { getAppointments } from '@/lib/api/appointments';
import { getResources } from '@/lib/api/resources';
import { getServices } from '@/lib/api/services';
import { getCurrentOrganization } from '@/lib/api/session';
import { addDays, weekDays } from './date-utils';
import { CalendarView } from './calendar-view';

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const org = await getCurrentOrganization();
  const tz = org.timezone;
  const today = zonedDayKey(new Date().toISOString(), tz);

  const view = sp.view === 'day' ? 'day' : 'week';
  const date = typeof sp.date === 'string' ? sp.date : today;
  const resourceId =
    typeof sp.resourceId === 'string' && sp.resourceId ? sp.resourceId : undefined;

  const days = view === 'week' ? weekDays(date) : [date];
  // Ventana UTC con padding para cubrir los días locales sin importar el offset.
  const from = `${addDays(days[0]!, -1)}T00:00:00.000Z`;
  const to = `${addDays(days[days.length - 1]!, 2)}T00:00:00.000Z`;

  const [appointments, resources, services] = await Promise.all([
    getAppointments({ from, to, resourceId }),
    getResources(),
    getServices(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Turnos por día y semana. Creá turnos internos y gestioná su estado.
        </p>
      </div>
      <CalendarView
        appointments={appointments}
        resources={resources}
        services={services}
        timezone={tz}
        view={view}
        date={date}
        resourceId={resourceId}
        todayKey={today}
      />
    </div>
  );
}
