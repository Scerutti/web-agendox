import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buttonVariants } from '@agendox/ui';
import { getService } from '@/lib/api/services';
import { ServiceDetail } from './service-detail';

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {service.name}
        </h1>
        <Link
          href="/services"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          ← Volver
        </Link>
      </div>
      <ServiceDetail service={service} />
    </div>
  );
}
