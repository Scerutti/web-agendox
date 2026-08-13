'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomerAuth } from '@/components/customer-auth';

/**
 * Identificación para entrar al portal, sin pasar por una reserva.
 *
 * Reusa el mismo componente que el wizard: son los mismos dos endpoints y la
 * misma escala de reenvíos, así que tenerlo dos veces sólo garantizaba que se
 * desincronizaran.
 */
export function LoginForm({ slug, next }: { slug: string; next: string }) {
  const router = useRouter();

  return (
    <CustomerAuth
      slug={slug}
      intro="Te identificamos por email con un código de un solo uso. No hace falta contraseña."
      back={
        <Link
          href={`/${slug}`}
          className="block text-center text-xs text-muted-foreground hover:underline"
        >
          ← Volver a reservar un turno
        </Link>
      }
      onAuthenticated={() => {
        // `refresh` antes de navegar: el portal es un server component y sin esto
        // se puede pintar con la respuesta cacheada de cuando no había sesión.
        router.refresh();
        router.replace(next);
      }}
    />
  );
}
