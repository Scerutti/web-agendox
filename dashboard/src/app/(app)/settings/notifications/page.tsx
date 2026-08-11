import { getNotificationSettings } from '@/lib/api/settings';
import { getOrganizationFeatures } from '@/lib/api/session';
import { NoAccess } from '@/components/no-access';
import { NotificationsForm } from './notifications-form';

export default async function NotificationsSettingsPage() {
  const [data, features] = await Promise.all([
    getNotificationSettings(),
    getOrganizationFeatures(),
  ]);
  if (!data) return <NoAccess resource="la configuración de notificaciones" />;
  return (
    <NotificationsForm data={data} whatsappAvailable={features.whatsappNotifications} />
  );
}
