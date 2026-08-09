import { tryServerFetch } from './server';
import type { DayOfWeek } from '@agendox/domain';

export interface BusinessSettings {
  businessName: string;
  timezone: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  locale?: string | null;
}

export interface BookingSettings {
  publicBookingEnabled: boolean;
  slotGranularityMinutes: number;
  minNoticeMinutes: number;
  maxAdvanceDays: number;
  cancellationPolicy?: string | null;
  requiresManualApproval: boolean;
}

export interface PaymentSettings {
  depositEnabled: boolean;
  depositType?: 'FIXED' | 'PERCENTAGE' | null;
  depositValue?: number | null;
  depositTtlHours?: number | null;
  bankName?: string | null;
  accountHolder?: string | null;
  alias?: string | null;
  cbu?: string | null;
  phone?: string | null;
  instructions?: string | null;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  remindersEnabled: boolean;
  reminderHoursBefore: number;
  templates?: Record<string, unknown> | null;
}

export interface BrandingSettings {
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  publicTitle?: string | null;
  publicDescription?: string | null;
}

export interface BusinessHour {
  dayOfWeek: DayOfWeek;
  opensAt?: string | null;
  closesAt?: string | null;
  isClosed: boolean;
  validFrom?: string | null;
  validTo?: string | null;
}

// Todas devuelven null si el rol no tiene permiso (403).
export const getBusinessSettings = () =>
  tryServerFetch<BusinessSettings>('/settings/business');
export const getBookingSettings = () =>
  tryServerFetch<BookingSettings>('/settings/booking');
export const getPaymentSettings = () =>
  tryServerFetch<PaymentSettings>('/settings/payment');
export const getNotificationSettings = () =>
  tryServerFetch<NotificationSettings>('/settings/notifications');
export const getBrandingSettings = () =>
  tryServerFetch<BrandingSettings>('/settings/branding');
export const getBusinessHours = () =>
  tryServerFetch<BusinessHour[]>('/settings/business-hours');
