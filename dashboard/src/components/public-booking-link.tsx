'use client';

import { Button, toast } from '@agendox/ui';

/**
 * El link público de reservas con un botón para copiarlo. Es la acción que el
 * dueño más repite —mandárselo a un cliente— y no tenía dónde hacerse: había
 * que armar la URL a mano a partir del slug.
 *
 * La URL llega armada desde el servidor (ver `lib/public-booking.ts`).
 */
export function PublicBookingLink({ url }: { url: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado');
    } catch {
      // Sin permiso de portapapeles (o sin HTTPS) el link igual está a la
      // vista y se puede seleccionar a mano.
      toast.error('No se pudo copiar. Copiá el link a mano.');
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* `break-all` + `min-w-0`: la URL es una sola palabra larga y sin esto
          estira la tarjeta más allá del ancho de un teléfono. */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1 break-all text-primary underline-offset-4 hover:underline"
      >
        {url}
      </a>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={copy}
      >
        Copiar
      </Button>
    </div>
  );
}
