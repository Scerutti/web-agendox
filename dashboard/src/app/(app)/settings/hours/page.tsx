import { getBusinessHours } from '@/lib/api/settings';
import { NoAccess } from '@/components/no-access';
import { HoursForm } from './hours-form';

export default async function HoursSettingsPage() {
  const hours = await getBusinessHours();
  if (!hours) return <NoAccess resource="los horarios del negocio" />;
  return <HoursForm hours={hours} />;
}
