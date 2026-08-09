import Link from 'next/link';
import { Badge, buttonVariants } from '@agendox/ui';
import { getResources } from '@/lib/api/resources';
import { getUsers } from '@/lib/api/users';
import { ResourceCreate } from './resource-create';

export default async function ResourcesPage() {
  const [resources, users] = await Promise.all([getResources(), getUsers()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Recursos</h1>
        <p className="text-sm text-muted-foreground">
          Personas, canchas, salas o equipamiento reservable.
        </p>
      </div>

      <ResourceCreate users={users} />

      <div className="overflow-x-auto rounded-lg border">
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
