import { redirect } from 'next/navigation';
import { AppFooter, brandThemeVars } from '@agendox/ui';
import {
  getCurrentOrganization,
  getSession,
  getSubscriptionStatus,
} from '@/lib/api/session';
import { getBrandingSettings } from '@/lib/api/settings';
import { DEFAULT_FEATURES, DEFAULT_TERMS } from '@/lib/api/types';
import { TermsGate } from '@/components/legal/terms-gate';
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
  const terms = org?.terms ?? DEFAULT_TERMS;
  // El gate es solo para el Owner: es quien puede obligar al negocio. El resto
  // del staff opera normalmente mientras el Owner no haya aceptado — dejarlos
  // afuera bloquearía la agenda por algo que no pueden resolver.
  const showTermsGate = session.role === 'OWNER' && terms.requiresAcceptance;

  return (
    // `overflow-x-clip` + `min-w-0`: sin esto, un hijo ancho (una tabla, una
    // fila de horarios) no puede encogerse —un flex item arranca con
    // `min-width: auto`— y estira toda la página, que es de dónde salía el
    // scroll horizontal en mobile. Se usa `clip` y no `hidden` para no crear un
    // contenedor de scroll. Lo que de verdad necesita ancho (la grilla del
    // calendario, las tablas) ya tiene su propio `overflow-x-auto`.
    <div
      className="brand-scope flex min-h-screen overflow-x-clip"
      style={brandThemeVars(branding?.primaryColor, branding?.secondaryColor)}
    >
      <Sidebar role={session.role} features={features} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
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
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
        <AppFooter />
      </div>
      {showTermsGate ? <TermsGate version={terms.currentVersion} /> : null}
    </div>
  );
}
