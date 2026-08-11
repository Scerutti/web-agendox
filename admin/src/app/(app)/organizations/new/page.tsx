import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, buttonVariants } from '@agendox/ui';
import { getPlans } from '@/lib/api/admin';
import { CreateOrgForm } from './create-org-form';

export const metadata = { title: 'Agendox · Nuevo negocio' };

export default async function NewOrganizationPage() {
  // Si la lectura de planes falla, el alta sigue siendo posible en modo prueba:
  // no vale bloquear el formulario entero por no poder ofrecer la opción de
  // suscripción activa.
  const plans = await getPlans().catch(() => []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo negocio</h1>
        <Link href="/organizations" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          ← Volver
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del alta</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateOrgForm plans={plans} />
        </CardContent>
      </Card>
    </div>
  );
}
