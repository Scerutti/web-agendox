// URL interna del backend (server-side y middleware). Incluye /api/v1.
// Se referencia directo para que Next la inyecte también en el runtime Edge.
export const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL ?? 'http://localhost:3000/api/v1';
