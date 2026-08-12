import Link from 'next/link';
import { Badge, Callout, buttonVariants } from '@agendox/ui';
import { getResources } from '@/lib/api/resources';
import { getUsers } from '@/lib/api/users';
import { sessionHasRole } from '@/lib/api/session';
import { NoAccess } from '@/components/no-access';
import { ResourceCreate } from './resource-create';

export default async function ResourcesPage() {
  // `getUsers()` es Owner/Admin: sin este corte, un rol operativo que entre por
  // URL recibe un 403 sin manejar y ve la pantalla de error.
  if (!(await sessionHasRole('OWNER', 'ADMIN'))) {
    return <NoAccess resource="los recursos" />;
  }

  const [resources, users] = await Promise.all([getResources(), getUsers()]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Recursos</h1>
        <Callout tone="info" title="Qué es un recurso">
          <p>
            Es <strong>quién atiende o dónde se atiende</strong>: cada persona, cancha,
            sala, box o equipo que se puede ocupar en un horario. Un recurso solo puede
            tomar un turno a la vez, y por eso es lo que define cuántos turnos podés dar
            en paralelo.
          </p>
          <p className="mt-1.5">
            Si tenés dos peluqueros, son dos recursos: se pueden reservar dos turnos a la
            misma hora. Si tenés uno solo, un turno por horario.{' '}
            <Link href="/services" className="font-medium text-primary hover:underline">
              Servicios
            </Link>{' '}
            es otra cosa: es <em>qué</em> se hace en ese turno.
          </p>
        </Callout>
      </div>

      <ResourceCreate users={users} />

      {/* Mobile lee la lista como tarjetas; desde `sm` vuelve la tabla. Cuatro
          columnas no entran en un teléfono. */}
      <div className="space-y-3 sm:hidden">
        {resources.length === 0 ? (
          <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Sin recursos todavía.
          </p>
        ) : (
          resources.map((r) => (
            <div key={r.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: r.color ?? '#94a3b8' }}
                    aria-hidden
                  />
                  <span className="truncate font-medium">{r.name}</span>
                </div>
                <Badge variant={r.active ? 'success' : 'muted'}>
                  {r.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{r.type}</p>
              <div className="border-t pt-3">
                <Link
                  href={`/resources/${r.id}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Gestionar
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3 font-medium">Recurso</th>
              <th className="p-3 font-medium">Tipo</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  Sin recursos todavía.
                </td>
              </tr>
            )}
            {resources.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: r.color ?? '#94a3b8' }}
                      aria-hidden
                    />
                    <span className="font-medium">{r.name}</span>
                  </div>
                </td>
                <td className="p-3">{r.type}</td>
                <td className="p-3">
                  <Badge variant={r.active ? 'success' : 'muted'}>
                    {r.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="whitespace-nowrap p-3 text-right">
                  <Link
                    href={`/resources/${r.id}`}
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
