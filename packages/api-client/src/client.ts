import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from '@agendox/api-types';

export interface ApiClientOptions {
  /** Base URL con prefijo, ej. http://localhost:3000/api/v1 */
  baseUrl: string;
  /**
   * Devuelve el access token a inyectar como `Authorization: Bearer`.
   * En el patrón BFF (FM1) esto lo resuelve el server-side de Next leyendo
   * la cookie httpOnly; en cliente, se omite (habla same-origin con Next).
   */
  getAccessToken?: () => string | undefined | Promise<string | undefined>;
  /**
   * Seam de refresh en 401 (se cablea en FM1 con /auth/refresh vía BFF).
   * Devuelve un nuevo access token o undefined si no se pudo refrescar.
   */
  onUnauthorized?: () => Promise<string | undefined>;
}

/**
 * Cliente tipado sobre el contrato de la API (openapi-fetch).
 * Las llamadas tipadas (`client.GET('/appointments', …)`) quedan disponibles
 * una vez generados los tipos con `pnpm gen:api`.
 */
export function createApiClient(opts: ApiClientOptions) {
  const client = createClient<paths>({ baseUrl: opts.baseUrl });

  const auth: Middleware = {
    async onRequest({ request }) {
      if (opts.getAccessToken) {
        const token = await opts.getAccessToken();
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      }
      return request;
    },
  };

  client.use(auth);
  return client;
}

export type ApiClient = ReturnType<typeof createApiClient>;
