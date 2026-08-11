import Link from 'next/link';
import { Badge, Callout, buttonVariants } from '@agendox/ui';
import { getServices } from '@/lib/api/services';
import { ServiceCreate } from './service-create';

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Servicios</h1>
        <Callout tone="info" title="Qué es un servicio y en qué se diferencia de un recurso">
          <p>
            El servicio es <strong>qué se hace</strong> en el turno: “Corte de pelo”,
            “Alquiler de cancha”, “Consulta”. Cada uno tiene sus{' '}
            <strong>opciones</strong>, y cada opción define la duración y el precio (“Corte
            simple, 30 min” y “Corte + barba, 45 min”).
          </p>
          <p className="mt-1.5">
            El{' '}
            <Link href="/resources" className="font-medium text-primary hover:underline">
              recurso
            </Link>{' '}
            es <strong>quién lo hace o dónde</strong>. El servicio dice cuánto dura y
            cuánto cuesta; el recurso dice si hay lugar a esa hora.
          </p>
          <p className="mt-1.5">
            <strong>Cómo se conectan:</strong> creá el servicio acá y después, en{' '}
            <Link href="/resources" className="font-medium text-primary hover:underline">
              Recursos
            </Link>{' '}
            → <em>Gestionar</em> → <em>Servicios que ofrece</em>, marcá qué recursos lo
            hacen. Un servicio sin ningún recurso asignado no se puede reservar.
          </p>
        </Callout>
      </div>

      <ServiceCreate />

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3 font-medium">Servicio</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted-foreground">
                  Sin servicios todavía.
                </td>
              </tr>
            )}
            {services.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="font-medium">{s.name}</div>
                  {s.description ? (
                    <div className="text-xs text-muted-foreground">
                      {s.description}
                    </div>
                  ) : null}
                </td>
                <td className="p-3">
                  <Badge variant={s.active ? 'success' : 'muted'}>
                    {s.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="whitespace-nowrap p-3 text-right">
                  <Link
                    href={`/services/${s.id}`}
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                  >
                    Gestionar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
