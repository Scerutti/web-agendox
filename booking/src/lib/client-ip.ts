import { headers } from 'next/headers';

/**
 * Cabecera con la IP del visitante, para adjuntar a los llamados al backend.
 *
 * El browser nunca le pega directo a la API: habla same-origin con Next y Next
 * reenvía (patrón BFF). Sin esto el backend ve siempre la misma IP —la del
 * deploy— y sus topes por IP terminan siendo topes globales compartidos entre
 * todos los visitantes: alcanzaba con que unos pocos pidieran su código de
 * acceso para que el resto se comiera un 429 sin haber hecho nada.
 *
 * Vercel ya pone `x-forwarded-for` en el pedido que entra; se toma la entrada
 * de más a la izquierda, que es la del cliente original.
 */
export async function clientIpHeaders(req?: Request): Promise<Record<string, string>> {
  const source = req?.headers ?? (await headers());
  const raw = source.get('x-forwarded-for') ?? source.get('x-real-ip');
  const ip = raw?.split(',')[0]?.trim();
  return ip ? { 'x-forwarded-for': ip } : {};
}
