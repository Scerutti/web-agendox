import { getBrandingSettings } from '@/lib/api/settings';
import { NoAccess } from '@/components/no-access';
import { BrandingForm } from './branding-form';

export default async function BrandingSettingsPage() {
  const data = await getBrandingSettings();
  if (!data) return <NoAccess resource="la configuración de marca" />;
  return <BrandingForm data={data} />;
}
