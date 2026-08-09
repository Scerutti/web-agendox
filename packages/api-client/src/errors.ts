// Envelope de error del backend (docs/api/endpoints.md).
export interface ErrorEnvelope {
  statusCode: number;
  code: string;
  message: string | string[];
  timestamp?: string;
  path?: string;
  requestId?: string;
  details?: unknown;
}

/**
 * Error normalizado de la API. Los llamadores inspeccionan los getters
 * (`isConflict`, `isBusinessRule`, …) en vez de comparar `status` a mano.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(init: {
    status: number;
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
    this.requestId = init.requestId;
  }

  /** 409 — el slot se ocupó recién: re-consultar disponibilidad. */
  get isConflict(): boolean {
    return this.status === 409;
  }
  /** 422 — regla de negocio / transición ilegal / gate de operación. */
  get isBusinessRule(): boolean {
    return this.status === 422;
  }
  /** 400 — validación de request. */
  get isValidation(): boolean {
    return this.status === 400;
  }
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isForbidden(): boolean {
    return this.status === 403;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

/** Construye un ApiError a partir de una Response no-OK. */
export async function toApiError(res: Response): Promise<ApiError> {
  let body: Partial<ErrorEnvelope> = {};
  try {
    body = (await res.json()) as Partial<ErrorEnvelope>;
  } catch {
    // respuesta sin cuerpo JSON
  }
  const message = Array.isArray(body.message)
    ? body.message.join(', ')
    : (body.message ?? res.statusText ?? 'Request failed');
  return new ApiError({
    status: body.statusCode ?? res.status,
    code: body.code ?? 'UNKNOWN',
    message,
    details: body.details,
    requestId: body.requestId,
  });
}

/** Normaliza el `error` que devuelve openapi-fetch a un ApiError. */
export function normalizeError(error: unknown, status: number): ApiError {
  const body = (error ?? {}) as Partial<ErrorEnvelope>;
  const message = Array.isArray(body.message)
    ? body.message.join(', ')
    : (body.message ?? 'Request failed');
  return new ApiError({
    status: body.statusCode ?? status,
    code: body.code ?? 'UNKNOWN',
    message,
    details: body.details,
    requestId: body.requestId,
  });
}
