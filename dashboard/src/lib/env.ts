/**
 * URL interna del backend, con el prefijo /api/v1 incluido.
 *
 * SOLO server-side: route handlers, server components y middleware. NUNCA
 * importar este módulo desde un client component ('use client'): en el bundle
 * del browser `process.env.API_INTERNAL_URL` no existe, así que el fetch
 * terminaría apuntando a cualquier lado. El código de cliente habla
 * same-origin con las route handlers de Next (patrón BFF), por ejemplo
 * `fetch('/api/auth/login')`.
 *
 * Se lee en runtime, tanto en el runtime Node (route handlers / server
 * components) como en el Edge del middleware: alcanza con tenerla definida en
 * el entorno del deploy (Vercel → Environment Variables).
 *
 * A propósito no hay default: si falta la variable, error explícito en lugar
 * de pegarle en silencio a un host hardcodeado.
 */
const RAW = process.env.API_INTERNAL_URL;

function baseUrl(): string {
  const value = RAW?.trim();
  if (!value) {
    throw new Error(
      'Falta la variable de entorno API_INTERNAL_URL (ej. https://api.ejemplo.com/api/v1). ' +
        'Definila en .env.local para dev y en Vercel → Settings → Environment Variables para los deploys.',
    );
  }
  return value.replace(/\/+$/, '');
}

/**
 * URL absoluta del backend para un path del contrato (`/auth/login`).
 * El path NO lleva el prefijo /api/v1: ya viene en API_INTERNAL_URL.
 */
export function apiUrl(path: string): string {
  return `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
