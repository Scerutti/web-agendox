import { serverFetch, tryServerFetch } from './server';
import type { BlockedTimeType, DayOfWeek } from '@agendox/domain';

export interface ResourceView {
  id: string;
  name: string;
  type: string;
  color: string | null;
  active: boolean;
  description: string | null;
  userId: string | null;
}

export interface ResourceScheduleEntry {
  dayOfWeek: DayOfWeek;
  startsAt: string;
  endsAt: string;
  validFrom?: string | null;
  validTo?: string | null;
}

export interface ResourceDetailView extends ResourceView {
  schedule: ResourceScheduleEntry[];
  serviceIds: string[];
}

export interface BlockedTimeView {
  id: string;
  resourceId: string | null;
  startsAt: string;
  endsAt: string;
  reason: string | null;
  type: BlockedTimeType;
  createdAt: string;
}

export const getResources = () => serverFetch<ResourceView[]>('/resources');
export const getResource = (id: string) =>
  tryServerFetch<ResourceDetailView>(`/resources/${id}`);
export const getBlockedTimes = () =>
  serverFetch<BlockedTimeView[]>('/blocked-times');
