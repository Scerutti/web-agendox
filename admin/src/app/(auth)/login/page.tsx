import { AppFooter, Card, CardContent, CardHeader, CardTitle } from '@agendox/ui';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Agendox · Plataforma</CardTitle>
            <p className="text-sm text-muted-foreground">Acceso de super administración.</p>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
      <AppFooter />
    </div>
  );
}
