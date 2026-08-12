import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@agendox/ui';
import { getSession } from '@/lib/api/session';
import { ROLE_LABEL } from '@/lib/org-ui';
import { PasswordForm } from './password-form';

/**
 * Cuenta del usuario. Existe para cualquier rol: es la única vía por la que un
 * recepcionista puede salir de la contraseña temporal con la que lo dieron de
 * alta.
 */
export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi cuenta</h1>
        <p className="text-sm text-muted-foreground">
          {session.email} · {ROLE_LABEL[session.role] ?? session.role}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Al cambiarla se cierran las demás sesiones abiertas con la contraseña
            anterior.
          </p>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
