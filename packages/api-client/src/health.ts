import { toApiError } from './errors';

export interface HealthStatus {
  status: string;
  info?: Record<string, unknown>;
  details?: Record<string, unknown>;
  error?: Record<string, unknown>;
}

/**
 * Health check del backend. `apiBaseUrl` incluye /api/v1; el endpoint /health
 * está SIN versión, así que derivamos el origin. Usado como smoke test de FM0.
 */
export async function healthCheck(apiBaseUrl: string): Promise<HealthStatus> {
  const origin = new URL(apiBaseUrl).origin;
  const res = await fetch(`${origin}/health`, { cache: 'no-store' });
  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as HealthStatus;
}
