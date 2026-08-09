'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/api/server';
import { actionError, actionOk, type ActionState } from '@/lib/actions';
import { bool, num, optNum, optStr, str } from '@/lib/form';
import { parseWeekIntervals } from '@/lib/schedule';
import type { DayOfWeek } from '@agendox/domain';

export async function saveBusiness(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  try {
    await serverFetch('/settings/business', {
      method: 'PUT',
      body: JSON.stringify({
        businessName: str(fd, 'businessName'),
        timezone: str(fd, 'timezone'),
        contactEmail: optStr(fd, 'contactEmail'),
        contactPhone: optStr(fd, 'contactPhone'),
        address: optStr(fd, 'address'),
        locale: optStr(fd, 'locale'),
      }),
    });
    revalidatePath('/settings/business');
    return actionOk();
  } catch (e) {
    return actionError(e);
  }
}

export async function saveBooking(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  try {
    await serverFetch('/settings/booking', {
      method: 'PUT',
      body: JSON.stringify({
        publicBookingEnabled: bool(fd, 'publicBookingEnabled'),
        slotGranularityMinutes: num(fd, 'slotGranularityMinutes'),
        minNoticeMinutes: num(fd, 'minNoticeMinutes'),
        maxAdvanceDays: num(fd, 'maxAdvanceDays'),
        cancellationPolicy: optStr(fd, 'cancellationPolicy'),
        requiresManualApproval: bool(fd, 'requiresManualApproval'),
      }),
    });
    revalidatePath('/settings/booking');
    return actionOk();
  } catch (e) {
    return actionError(e);
  }
}

export async function savePayment(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const depositEnabled = bool(fd, 'depositEnabled');
  try {
    await serverFetch('/settings/payment', {
      method: 'PUT',
      body: JSON.stringify({
        depositEnabled,
        depositType: depositEnabled ? str(fd, 'depositType') : undefined,
        depositValue: depositEnabled ? num(fd, 'depositValue') : undefined,
        depositTtlHours: depositEnabled ? optNum(fd, 'depositTtlHours') : undefined,
        bankName: optStr(fd, 'bankName'),
        accountHolder: optStr(fd, 'accountHolder'),
        alias: optStr(fd, 'alias'),
        cbu: optStr(fd, 'cbu'),
        phone: optStr(fd, 'phone'),
        instructions: optStr(fd, 'instructions'),
      }),
    });
    revalidatePath('/settings/payment');
    return actionOk();
  } catch (e) {
    return actionError(e);
  }
}

export async function saveNotifications(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  try {
    await serverFetch('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify({
        emailEnabled: bool(fd, 'emailEnabled'),
        whatsappEnabled: bool(fd, 'whatsappEnabled'),
        remindersEnabled: bool(fd, 'remindersEnabled'),
        reminderHoursBefore: num(fd, 'reminderHoursBefore'),
      }),
    });
    revalidatePath('/settings/notifications');
    return actionOk();
  } catch (e) {
    return actionError(e);
  }
}

export async function saveBranding(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  try {
    await serverFetch('/settings/branding', {
      method: 'PUT',
      body: JSON.stringify({
        logoUrl: optStr(fd, 'logoUrl'),
        primaryColor: optStr(fd, 'primaryColor'),
        secondaryColor: optStr(fd, 'secondaryColor'),
        publicTitle: optStr(fd, 'publicTitle'),
        publicDescription: optStr(fd, 'publicDescription'),
      }),
    });
    revalidatePath('/settings/branding');
    return actionOk();
  } catch (e) {
    return actionError(e);
  }
}

export async function saveHours(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const week = parseWeekIntervals(fd.get('payload'));
  const hours = [];
  for (let d = 0; d < 7; d++) {
    const intervals = week[d] ?? [];
    if (intervals.length === 0) {
      hours.push({ dayOfWeek: d as DayOfWeek, isClosed: true });
      continue;
    }
    for (const interval of intervals) {
      hours.push({
        dayOfWeek: d as DayOfWeek,
        isClosed: false,
        opensAt: interval.start,
        closesAt: interval.end,
      });
    }
  }
  try {
    await serverFetch('/settings/business-hours', {
      method: 'PUT',
      body: JSON.stringify({ hours }),
    });
    revalidatePath('/settings/hours');
    return actionOk();
  } catch (e) {
    return actionError(e);
  }
}
