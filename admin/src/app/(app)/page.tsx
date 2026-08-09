import { Card, CardContent, CardHeader, CardTitle } from '@agendox/ui';
import { getMetrics } from '@/lib/api/admin';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function MetricsPage() {
  const m = await getMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Métricas</h1>
        <p className="text-sm text-muted-foreground">Estado global de la plataforma.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Organizaciones" value={m.organizations.total} />
        <Stat label="Suscripciones activas" value={m.activeSubscriptions} />
        <Stat label="Pruebas activas" value={m.activeTrials} />
        <Stat label="Turnos (total)" value={m.totalAppointments} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organizaciones por estado</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <Stat label="En prueba" value={m.organizations.trial} />
          <Stat label="Activas" value={m.organizations.active} />
          <Stat label="Suspendidas" value={m.organizations.suspended} />
          <Stat label="Deshabilitadas" value={m.organizations.disabled} />
        </CardContent>
      </Card>
    </div>
  );
}
