import { getBrandingSettings } from '@/lib/api/settings';
import { getOrganizationFeatures } from '@/lib/api/session';
import { NoAccess } from '@/components/no-access';
import { BrandingForm } from './branding-form';

export default async function BrandingSettingsPage() {
  const [data, features] = await Promise.all([
    getBrandingSettings(),
    getOrganizationFeatures(),
  ]);
  if (!data) return <NoAccess resource="la configuración de marca" />;
  return <BrandingForm data={data} logoUploadAvailable={features.logoUpload} />;
}
