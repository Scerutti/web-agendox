import Link from 'next/link';
import { Badge, buttonVariants } from '@agendox/ui';
import { getOrganizations, ORG_STATUS_UI, SUBSCRIPTION_STATUS_LABEL } from '@/lib/api/admin';
import { OrgFilters } from './org-filters';

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = '', q = '' } = await searchParams;
  const orgs = await getOrganizations({ status, q });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organizaciones</h1>
          <p className="text-sm text-muted-foreground">
            Todas las cuentas de la plataforma. El alta de negocios se hace desde acá.
          </p>
        </div>
        <Link href="/organizations/new" className={buttonVariants({ size: 'sm' })}>
          Nuevo negocio
        </Link>
      </div>

      <OrgFilters status={status} q={q} />

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3 font-medium">Negocio</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3 font-medium">Suscripción</th>
              <th className="p-3 font-medium">Alta</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Sin resultados.
                </td>
              </tr>
            )}
            {orgs.map((o) => {
              const ui = ORG_STATUS_UI[o.status] ?? { label: o.status, variant: 'muted' as const };
              return (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-muted-foreground">/{o.slug}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant={ui.variant}>{ui.label}</Badge>
                  </td>
                  <td className="p-3">
                    {o.subscriptionStatus
                      ? `${SUBSCRIPTION_STATUS_LABEL[o.subscriptionStatus] ?? o.subscriptionStatus}${o.planName ? ` · ${o.planName}` : ''}`
                      : '—'}
                  </td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    <Link
                      href={`/organizations/${o.id}`}
                      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
