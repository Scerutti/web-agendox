import { getBookingSettings } from '@/lib/api/settings';
import { NoAccess } from '@/components/no-access';
import { BookingForm } from './booking-form';

export default async function BookingSettingsPage() {
  const data = await getBookingSettings();
  if (!data) return <NoAccess resource="la configuración de reservas" />;
  return <BookingForm data={data} />;
}
