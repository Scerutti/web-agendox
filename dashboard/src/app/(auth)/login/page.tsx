import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@agendox/ui';
import { LoginForm } from '@/components/auth/login-form';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>Panel del negocio · Agendox</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        {/* Las cuentas las crea el super admin: no hay auto-registro. Si alguien
            llega sin credenciales, el camino es pedirlas, no darse de alta. */}
        <p className="text-xs text-muted-foreground">
          Las cuentas las habilita el equipo de Agendox. Si todavía no tenés
          acceso, escribinos y te damos de alta el negocio.
        </p>
      </CardContent>
    </Card>
  );
}
