import { getBusinessSettings } from '@/lib/api/settings';
import { NoAccess } from '@/components/no-access';
import { BusinessForm } from './business-form';

export default async function BusinessSettingsPage() {
  const data = await getBusinessSettings();
  if (!data) return <NoAccess resource="la configuración del negocio" />;
  return <BusinessForm data={data} />;
}
