import { redirect } from 'next/navigation';
import { brandThemeVars } from '@agendox/ui';
import {
  getCurrentOrganization,
  getSession,
  getSubscriptionStatus,
} from '@/lib/api/session';
import { getBrandingSettings } from '@/lib/api/settings';
import { DEFAULT_FEATURES } from '@/lib/api/types';
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
  // Si la organización no se pudo leer, se asumen los defaults de plataforma:
  // esconder secciones por un error de red sería peor que mostrarlas.
  const features = org?.features ?? DEFAULT_FEATURES;

  return (
    <div
      className="brand-scope flex min-h-screen"
      style={brandThemeVars(branding?.primaryColor, branding?.secondaryColor)}
    >
      <Sidebar role={session.role} features={features} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          orgName={org?.name ?? 'Mi negocio'}
          email={session.email}
          role={session.role}
          features={features}
        />
        <TrialBanner
          sub={sub}
          timezone={org?.timezone ?? 'UTC'}
          features={features}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
