/**
 * URL pública donde el cliente pide un turno: es lo que el negocio pega en su
 * Instagram, en WhatsApp o en un cartel.
 *
 * El host de la app `booking` no cambia por organización —lo que cambia es el
 * slug—, así que viaja como variable de entorno con el deploy de producción
 * como valor por defecto: si falta la variable, el link sigue siendo correcto
 * en vez de quedar vacío o roto. En dev se apunta al booking local con
 * `BOOKING_BASE_URL=http://localhost:3002`.
 *
 * Es server-side (sin `NEXT_PUBLIC`, como el resto de la config): la página que
 * lo muestra es un Server Component y se lo pasa ya armado al cliente.
 */
const DEFAULT_BOOKING_BASE_URL = 'https://web-agendox-booking.vercel.app';

export function publicBookingUrl(slug: string): string {
  const base = process.env.BOOKING_BASE_URL?.trim() || DEFAULT_BOOKING_BASE_URL;
  return `${base.replace(/\/+$/, '')}/${slug}`;
}
