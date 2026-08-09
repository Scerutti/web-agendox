// Enums del dominio, alineados con docs/api/endpoints.md (contrato del backend MVP).

export const AppointmentStatus = {
  PENDING_DEPOSIT: 'PENDING_DEPOSIT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const AppointmentSource = {
  PUBLIC: 'PUBLIC',
  INTERNAL: 'INTERNAL',
} as const;
export type AppointmentSource =
  (typeof AppointmentSource)[keyof typeof AppointmentSource];

export const DepositStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;
export type DepositStatus = (typeof DepositStatus)[keyof typeof DepositStatus];

export const DepositType = {
  FIXED: 'FIXED',
  PERCENTAGE: 'PERCENTAGE',
} as const;
export type DepositType = (typeof DepositType)[keyof typeof DepositType];

export const BlockedTimeType = {
  VACATION: 'VACATION',
  LICENSE: 'LICENSE',
  MAINTENANCE: 'MAINTENANCE',
  MANUAL: 'MANUAL',
} as const;
export type BlockedTimeType =
  (typeof BlockedTimeType)[keyof typeof BlockedTimeType];

export const ClientStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type ClientStatus = (typeof ClientStatus)[keyof typeof ClientStatus];

export const SubscriptionStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  SUSPENDED: 'SUSPENDED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;
export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const Role = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
  RESOURCE_OPERATOR: 'RESOURCE_OPERATOR',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

/** 0 = domingo … 6 = sábado (convención del backend). */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
