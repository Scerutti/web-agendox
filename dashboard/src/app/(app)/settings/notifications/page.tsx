import { getNotificationSettings } from '@/lib/api/settings';
import { NoAccess } from '@/components/no-access';
import { NotificationsForm } from './notifications-form';

export default async function NotificationsSettingsPage() {
  const data = await getNotificationSettings();
  if (!data) return <NoAccess resource="la configuración de notificaciones" />;
  return <NotificationsForm data={data} />;
}
