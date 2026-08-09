import { getPaymentSettings } from '@/lib/api/settings';
import { NoAccess } from '@/components/no-access';
import { PaymentForm } from './payment-form';

export default async function PaymentSettingsPage() {
  const data = await getPaymentSettings();
  if (!data) return <NoAccess resource="la configuración de seña/pagos" />;
  return <PaymentForm data={data} />;
}
