import Link from 'next/link';
import type { Role } from '@agendox/domain';
import { ThemeToggle } from '@agendox/ui';
import type { OrganizationFeatures } from '@/lib/api/types';
import { LogoutButton } from './logout-button';
import { DashboardNotifications } from './dashboard-notifications';
import { MobileNav } from './mobile-nav';

export function Topbar({
  orgName,
  email,
  role,
  features,
}: {
  orgName: string;
  email: string;
  role: Role;
  features: OrganizationFeatures;
}) {
  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav role={role} features={features} email={email} />
        <span className="truncate font-semibold">{orgName}</span>
      </div>
      {/*
        En mobile a la derecha queda **solo** la campanita. El selector de tema
        son tres botones y "Cerrar sesión" es texto: juntos se comían más de
        media barra y truncaban el nombre del negocio hasta hacerlo ilegible.
        Todo eso vive ahora en el menú hamburguesa; la campanita se queda porque
        es un indicador con estado —lleva el contador de no leídas— y esconderla
        detrás de un menú la vuelve inútil.
      */}
      <div className="flex shrink-0 items-center gap-2">
        <DashboardNotifications />
        <ThemeToggle className="hidden md:inline-flex" />
        <Link
          href="/account"
          className="hidden rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground md:inline-block"
          title="Mi cuenta"
        >
          {email}
        </Link>
        <div className="hidden md:block">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
