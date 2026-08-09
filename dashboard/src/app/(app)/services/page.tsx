import Link from 'next/link';
import { Badge, buttonVariants } from '@agendox/ui';
import { getServices } from '@/lib/api/services';
import { ServiceCreate } from './service-create';

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Servicios</h1>
        <p className="text-sm text-muted-foreground">
          Servicios y sus opciones (duración y precio).
        </p>
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
