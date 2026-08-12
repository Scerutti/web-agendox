import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buttonVariants } from '@agendox/ui';
import {
  getBlockedTimes,
  getResource,
} from '@/lib/api/resources';
import { getServices } from '@/lib/api/services';
import { getUsers } from '@/lib/api/users';
import { getCurrentOrganization, sessionHasRole } from '@/lib/api/session';
import { NoAccess } from '@/components/no-access';
import { ResourceDetail } from './resource-detail';

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Igual que el listado: `getUsers()` es Owner/Admin y rompería la página.
  if (!(await sessionHasRole('OWNER', 'ADMIN'))) {
    return <NoAccess resource="los recursos" />;
  }

  const resource = await getResource(id);
  if (!resource) notFound();

  const [services, allBlocked, org, users] = await Promise.all([
    getServices(),
    getBlockedTimes(),
    getCurrentOrganization(),
    getUsers(),
  ]);
  const blockedTimes = allBlocked.filter((b) => b.resourceId === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {resource.name}
        </h1>
        <Link
          href="/resources"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          ← Volver
        </Link>
      </div>
      <ResourceDetail
        resource={resource}
        services={services}
        blockedTimes={blockedTimes}
        timezone={org.timezone}
        users={users}
      />
    </div>
  );
}
