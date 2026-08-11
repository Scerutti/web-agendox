import { redirect } from 'next/navigation';
import { brandThemeVars } from '@agendox/ui';
import {
  getCurrentOrganization,
  getSession,
  getSubscriptionStatus,
} from '@/lib/api/session';
import { getBrandingSettings } from '@/lib/api/settings';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { TrialBanner } from '@/components/shell/trial-banner';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const [orgResult, subResult, brandingResult] = await Promise.allSettled([
    getCurrentOrganization(),
    getSubscriptionStatus(),
    getBrandingSettings(),
  ]);
  const org = orgResult.status === 'fulfilled' ? orgResult.value : null;
  const sub = subResult.status === 'fulfilled' ? subResult.value : null;
  // El staff sin permiso de configuración recibe null: el panel cae a los
  // colores por defecto en vez de romperse.
  const branding = brandingResult.status === 'fulfilled' ? brandingResult.value : null;

  return (
    <div
      className="brand-scope flex min-h-screen"
      style={brandThemeVars(branding?.primaryColor, branding?.secondaryColor)}
    >
      <Sidebar role={session.role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          orgName={org?.name ?? 'Mi negocio'}
          email={session.email}
          role={session.role}
        />
        <TrialBanner sub={sub} timezone={org?.timezone ?? 'UTC'} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
