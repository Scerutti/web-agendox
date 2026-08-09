export interface AvailabilitySlot {
  date: string;
  start: string;
  end: string;
  resourceId: string;
}

export interface AvailabilityResult {
  timeZone: string;
  durationMinutes: number;
  slots: AvailabilitySlot[];
}
