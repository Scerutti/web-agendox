import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@agendox/ui';
import { getPublicOrg } from '@/lib/api/public';
import { hasCustomerSession } from '@/lib/api/customer';
import { LoginForm } from './login-form';

// Una pantalla de identificación no aporta nada en un buscador.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Sólo se acepta volver a una ruta interna de este negocio. Sin este filtro, un
 * `?next=` armado a mano convierte la pantalla en un redirector a cualquier
 * sitio, con la credibilidad del dominio del negocio puesta encima.
 */
function safeNext(next: string | undefined, slug: string): string {
  const fallback = `/${slug}/portal`;
  if (!next) return fallback;
  return next === `/${slug}` || next.startsWith(`/${slug}/`) ? next : fallback;
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { slug } = await params;
  const { next } = await searchParams;

  const org = await getPublicOrg(slug);
  if (!org) notFound();

  const destination = safeNext(next, slug);
  // Con sesión abierta esta pantalla no tiene nada que pedir.
  if (await hasCustomerSession(slug)) redirect(destination);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar a mis turnos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm slug={slug} next={destination} />
      </CardContent>
    </Card>
  );
}
