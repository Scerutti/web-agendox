'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { Badge, Button, Callout, Input, toast } from '@agendox/ui';
import { Field, SubmitButton } from '@/components/form';
import { USER_ROLE_LABEL, type AdminOrgUser } from '@/lib/api/admin.types';
import {
  createOrganizationUser,
  resetOrganizationUserPassword,
  setOrganizationUserStatus,
  type UserActionResult,
} from '../actions';

const IDLE: UserActionResult = { ok: false, message: '' };

/**
 * Staff del negocio. El alta vive acá y no en el panel del negocio: el dueño ve
 * su equipo en modo lectura, pero quien da de alta y de baja es la plataforma.
 */
export function OrgUsers({ id, users }: { id: string; users: AdminOrgUser[] }) {
  const [state, action] = useActionState(createOrganizationUser.bind(null, id), IDLE);
  const [pending, startTransition] = useTransition();
  /** Contraseña recién emitida, por usuario. Se muestra hasta que se recarga. */
  const [issued, setIssued] = useState<{ label: string; password: string } | null>(null);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      if (state.temporaryPassword) {
        setIssued({
          label: state.email ?? 'el usuario nuevo',
          password: state.temporaryPassword,
        });
      }
    } else {
      toast.error(state.message);
    }
  }, [state]);

  function toggleStatus(user: AdminOrgUser) {
    startTransition(async () => {
      const next = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await setOrganizationUserStatus(id, user.id, next);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  function resetPassword(user: AdminOrgUser) {
    startTransition(async () => {
      const res = await resetOrganizationUserPassword(id, user.id);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      if (res.temporaryPassword) {
        setIssued({ label: user.email, password: res.temporaryPassword });
      }
    });
  }

  return (
    <div className="space-y-6">
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Esta organización todavía no tiene usuarios.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Usuario</th>
                <th className="py-2 pr-4 font-medium">Rol</th>
                <th className="py-2 pr-4 font-medium">Estado</th>
                <th className="py-2 pr-4 font-medium">Último ingreso</th>
                <th className="py-2 font-medium" />
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
                  <td className="py-2 pr-4">{USER_ROLE_LABEL[user.role] ?? user.role}</td>
                  <td className="py-2 pr-4">
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : 'muted'}>
                      {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString('es-AR')
                      : 'Nunca'}
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => resetPassword(user)}
                      >
                        Resetear contraseña
                      </Button>
                      {/* El dueño no se desactiva desde acá: sin Owner activo el
                          negocio queda sin quien administre su configuración. */}
                      {user.role === 'OWNER' ? null : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pending}
                          onClick={() => toggleStatus(user)}
                        >
                          {user.status === 'ACTIVE' ? 'Desactivar' : 'Reactivar'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* La contraseña se muestra una sola vez: el backend guarda el hash, así
          que si se pierde la única salida es volver a resetearla. */}
      {issued ? (
        <Callout tone="warning">
          <p className="font-medium">Contraseña temporal de {issued.label}</p>
          <code className="mt-1 block break-all rounded bg-muted px-2 py-1 font-mono text-sm">
            {issued.password}
          </code>
          <p className="mt-2 text-xs">
            Copiala ahora: no se vuelve a mostrar. Pasásela al negocio y pedile que la
            cambie desde su panel al primer ingreso.
          </p>
        </Callout>
      ) : null}

      <form action={action} className="space-y-4 border-t pt-6">
        <div>
          <h3 className="text-sm font-medium">Agregar recepcionista</h3>
          <p className="text-xs text-muted-foreground">
            Ve el calendario, los turnos y los clientes. No accede a servicios, recursos,
            configuración, señas ni suscripción.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nombre" htmlFor="firstName">
            <Input id="firstName" name="firstName" required autoComplete="off" />
          </Field>
          <Field label="Apellido" htmlFor="lastName">
            <Input id="lastName" name="lastName" required autoComplete="off" />
          </Field>
        </div>
        <Field
          label="Email"
          htmlFor="email"
          hint="Es su usuario de acceso. Tiene que ser único en toda la plataforma."
        >
          <Input id="email" name="email" type="email" required autoComplete="off" />
        </Field>
        <SubmitButton pendingLabel="Creando…">Crear recepcionista</SubmitButton>
      </form>
    </div>
  );
}
