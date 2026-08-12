import type { Role, SubscriptionStatus } from '@agendox/domain';

// Formas de respuesta del backend (docs/api/endpoints.md). Cuando se corra
// `pnpm gen:api`, estas se pueden reemplazar por las de @agendox/api-types.

export interface Session {
  userId: string;
  organizationId: string;
  role: Role;
  email: string;
}

/**
 * Funcionalidades que la plataforma habilita para este negocio. Las gobierna el
 * super admin; el panel las usa para decidir qué mostrar habilitado y qué
 * mostrar apagado con su explicación.
 */
export interface OrganizationFeatures {
  whatsappNotifications: boolean;
  logoUpload: boolean;
  /** Sección de Suscripción visible. Apagada en cuentas de cortesía o internas. */
  subscriptionsEnabled: boolean;
}

/**
 * Fallback cuando no se pudo leer la organización. Espeja los defaults del
 * backend: lo que todavía no existe, apagado; lo que ya funciona, prendido.
 */
export const DEFAULT_FEATURES: OrganizationFeatures = {
  whatsappNotifications: false,
  logoUpload: false,
  subscriptionsEnabled: true,
};

/**
 * Estado de aceptación de los Términos y Condiciones del negocio. La versión
 * vigente la decide el backend, no el frontend: `@agendox/legal` exporta la
 * misma cadena solo para mostrarla en el documento.
 */
export interface TermsStatus {
  currentVersion: string;
  acceptedVersion: string | null;
  acceptedAt: string | null;
  acceptedByUserId: string | null;
  requiresAcceptance: boolean;
}

/**
 * Fallback cuando no se pudo leer la organización: se asume que **no** hace
 * falta aceptar. Bloquear el panel con un modal inescapable por un error de red
 * sería peor que mostrarlo de más en la carga siguiente.
 */
export const DEFAULT_TERMS: TermsStatus = {
  currentVersion: '',
  acceptedVersion: null,
  acceptedAt: null,
  acceptedByUserId: null,
  requiresAcceptance: false,
};

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  createdAt: string;
  features: OrganizationFeatures;
  terms: TermsStatus;
}

export interface SubscriptionInfo {
  canOperate: boolean;
  trial: { active: boolean; endsAt: string } | null;
  subscription: {
    status: SubscriptionStatus;
    planId: string;
    planName: string;
    currentPeriodEnd: string;
  } | null;
}
