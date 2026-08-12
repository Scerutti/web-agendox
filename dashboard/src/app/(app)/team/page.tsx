import { Badge, Callout, Card, CardContent, CardHeader, CardTitle } from '@agendox/ui';
import { tryServerFetch } from '@/lib/api/server';
import { NoAccess } from '@/components/no-access';
import { ROLE_LABEL } from '@/lib/org-ui';
import type { UserView } from '@/lib/api/users.types';

/**
 * Equipo del negocio, **solo lectura**.
 *
 * Las altas y bajas de usuarios las hace la plataforma, no el negocio (ver el
 * plan de la ronda). Esta pantalla existe igual porque el dueño responde por los
 * datos de sus clientes: tiene que poder ver qué cuentas acceden a su agenda.
 */
export default async function TeamPage() {
  // `GET /users` es Owner+Admin; para cualquier otro rol el backend devuelve 403
  // y acá se muestra el cartel en vez de romper el render.
  const users = await tryServerFetch<UserView[]>('/users');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Equipo</h1>
        <p className="text-sm text-muted-foreground">
          Quiénes tienen acceso al panel de tu negocio.
        </p>
      </div>

      {!users ? (
        <NoAccess resource="el equipo" />
      ) : (
        <>
          <Callout tone="info">
            Para agregar, desactivar o cambiar un usuario, escribinos: las altas y bajas
            del equipo las gestiona Agendox.
          </Callout>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              {/*
                Mobile lee la lista como tarjetas y desde `sm` como tabla. Cuatro
                columnas no entran en un teléfono, y el `overflow-x-auto` no
                arreglaba nada: solo escondía el desborde detrás de un scroll
                lateral que nadie descubre.
              */}
              <div className="space-y-3 sm:hidden">
                {users.map((user) => (
                  <div key={user.id} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Badge variant={user.status === 'ACTIVE' ? 'success' : 'muted'}>
                        {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <dl className="grid grid-cols-2 gap-2 border-t pt-2 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Rol</dt>
                        <dd>{ROLE_LABEL[user.role] ?? user.role}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Último ingreso</dt>
                        <dd>
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString('es-AR')
                            : 'Nunca'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Usuario</th>
                      <th className="py-2 pr-4 font-medium">Rol</th>
                      <th className="py-2 pr-4 font-medium">Estado</th>
                      <th className="py-2 font-medium">Último ingreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </td>
                        <td className="py-2 pr-4">{ROLE_LABEL[user.role] ?? user.role}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={user.status === 'ACTIVE' ? 'success' : 'muted'}>
                            {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleString('es-AR')
                            : 'Nunca'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
