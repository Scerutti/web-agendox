/**
 * Tipos y metadatos de presentación del panel de plataforma.
 *
 * Vive separado de `admin.ts` a propósito: ese módulo importa `next/headers` para
 * leer la cookie de sesión, así que solo puede correr del lado del servidor. Los
 * componentes cliente importan desde acá.
 */

export interface AdminMetrics {
  organizations: {
    total: number;
    trial: number;
    active: number;
    suspended: number;
    disabled: number;
  };
  activeSubscriptions: number;
  activeTrials: number;
  totalAppointments: number;
}

export interface AdminOrgListItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  createdAt: string;
  subscriptionStatus: string | null;
  planName: string | null;
}

/**
 * Funcionalidades que la plataforma habilita por organización. Sirven para
 * apagar lo que todavía no está implementado (WhatsApp) o lo que depende de
 * infraestructura que falta (subida de archivos).
 */
export interface OrganizationFeatures {
  whatsappNotifications: boolean;
  logoUpload: boolean;
  subscriptionsEnabled: boolean;
}

export interface PlanView {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: string;
}

/** Con qué arranca comercialmente un negocio nuevo. */
export type OrganizationBilling = 'TRIAL' | 'ACTIVE';

/**
 * Aceptación de los Términos y Condiciones de la organización. Sirve para
 * auditar qué versión aceptaron, quién y cuándo, sin entrar a la base.
 */
export interface AdminOrgTerms {
  currentVersion: string;
  acceptedVersion: string | null;
  acceptedAt: string | null;
  acceptedByUserId: string | null;
  /** `null` si el usuario que aceptó fue dado de baja después. */
  acceptedByEmail: string | null;
  requiresAcceptance: boolean;
}

export interface AdminOrgDetail extends AdminOrgListItem {
  ownerEmail: string | null;
  currentPeriodEnd: string | null;
  trial: { status: string; endsAt: string } | null;
  counts: { users: number; appointments: number };
  features: OrganizationFeatures;
  terms: AdminOrgTerms;
}

export interface SuperAdminMe {
  superAdminId: string;
  email: string;
}

/** Usuario interno de una organización (staff del negocio). */
export interface AdminOrgUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'RESOURCE_OPERATOR';
  status: 'ACTIVE' | 'INACTIVE';
  lastLoginAt: string | null;
  createdAt: string;
}

export const USER_ROLE_LABEL: Record<AdminOrgUser['role'], string> = {
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  RECEPTIONIST: 'Recepcionista',
  RESOURCE_OPERATOR: 'Operador de recurso',
};

/** Metadatos de cada flag, para que el panel no repita el copy. */
export const FEATURE_UI: {
  key: keyof OrganizationFeatures;
  label: string;
  hint: string;
}[] = [
  {
    key: 'whatsappNotifications',
    label: 'Notificaciones por WhatsApp',
    hint: 'La integración todavía no está implementada. Dejalo apagado salvo que estés probando.',
  },
  {
    key: 'logoUpload',
    label: 'Subida de logo como archivo',
    hint: 'Requiere almacenamiento de imágenes. Con el flag apagado, el negocio igual puede usar un logo por URL.',
  },
  {
    key: 'subscriptionsEnabled',
    label: 'Sección de Suscripción',
    hint: 'Prendido por defecto. Apagalo en cuentas de cortesía, internas o de demo: el negocio deja de ver el plan y el checkout de pago.',
  },
];

/** UI labels + badge variants for organization status. */
export const ORG_STATUS_UI: Record<
  string,
  { label: string; variant: 'success' | 'muted' | 'destructive' }
> = {
  TRIAL: { label: 'Prueba', variant: 'muted' },
  ACTIVE: { label: 'Activa', variant: 'success' },
  SUSPENDED: { label: 'Suspendida', variant: 'destructive' },
  DISABLED: { label: 'Deshabilitada', variant: 'muted' },
};

export const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente de pago',
  ACTIVE: 'Activa',
  PAST_DUE: 'Pago vencido',
  SUSPENDED: 'Suspendida',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Vencida',
};
