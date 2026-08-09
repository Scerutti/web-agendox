// Decodificación del `exp` del JWT sin verificar firma (solo para decidir si
// hay que refrescar). Edge-safe: usa atob, no Buffer. La autorización real la
// hace el backend en cada request.

function b64urlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  return atob(b64 + pad);
}

export function decodeExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(b64urlDecode(parts[1]!)) as { exp?: unknown };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/** true si el token venció (o vence dentro de `skewSeconds`), o no tiene exp. */
export function isExpired(token: string, skewSeconds = 30): boolean {
  const exp = decodeExp(token);
  if (exp == null) return true;
  return Date.now() / 1000 >= exp - skewSeconds;
}
