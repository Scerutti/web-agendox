import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, buttonVariants } from '@agendox/ui';
import { CreateOrgForm } from './create-org-form';

export const metadata = { title: 'Agendox · Nuevo negocio' };

export default function NewOrganizationPage() {
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
          <CreateOrgForm />
        </CardContent>
      </Card>
    </div>
  );
}
