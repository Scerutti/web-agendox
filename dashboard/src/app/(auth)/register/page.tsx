import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@agendox/ui';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Registrá tu negocio</CardTitle>
        <CardDescription>
          Creá la organización y tu usuario titular. Empezás con un período de
          prueba.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RegisterForm />
        <p className="text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link className="text-primary hover:underline" href="/login">
            Iniciá sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
