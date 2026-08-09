import { Suspense } from 'react';
import Link from 'next/link';
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
        <p className="text-sm text-muted-foreground">
          ¿No tenés cuenta?{' '}
          <Link className="text-primary hover:underline" href="/register">
            Registrá tu negocio
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
