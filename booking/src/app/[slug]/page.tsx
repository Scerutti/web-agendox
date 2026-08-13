import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buttonVariants } from '@agendox/ui';
import { getPublicOrg, getPublicServices } from '@/lib/api/public';
import { getCustomerSession } from '@/lib/api/customer';
import { BookingWizard } from './booking-wizard';

export default async function SlugHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getPublicOrg(slug);
  if (!org) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          Reservá tu turno
        </h1>
        <Link
          href={`/${slug}/portal`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Mis turnos
        </Link>
      </div>

      {org.publicBookingEnabled ? (
        <BookingWizard
          slug={slug}
          timezone={org.timezone}
          services={await getPublicServices(slug)}
          session={await getCustomerSession(slug)}
        />
      ) : (
        <p className="rounded-lg border p-6 text-sm text-muted-foreground">
          Este negocio todavía no habilitó la reserva online.
        </p>
      )}
    </div>
  );
}
