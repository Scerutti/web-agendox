import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { hasCustomerSession, loginUrl } from '@/lib/api/customer';

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
  // Este chequeo **no alcanza solo**: Next renderiza el layout y la página en
  // paralelo, así que la página igual llega a pedirle datos a la API antes de
  // que este redirect se aplique. Cada página del portal repite el corte con
  // `requireCustomerSession`; no es redundante.
  if (!(await hasCustomerSession(slug))) {
    // Sin `next` porque el layout no conoce la ruta concreta; la página que
    // corre en paralelo sí, y su redirect es el que lleva el destino.
    redirect(loginUrl(slug));
  }
  return <>{children}</>;
}
