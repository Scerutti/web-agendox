import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { hasCustomerSession } from '@/lib/api/customer';

// El portal del cliente no se indexa.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await hasCustomerSession(slug))) {
    redirect(`/${slug}`);
  }
  return <>{children}</>;
}
