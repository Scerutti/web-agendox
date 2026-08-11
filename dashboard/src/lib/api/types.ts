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
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  createdAt: string;
  features: OrganizationFeatures;
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
