import Link from 'next/link';
import type { Role } from '@agendox/domain';
import { ThemeToggle, ThemeToggleButton } from '@agendox/ui';
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
    // Pegada arriba **solo en mobile**: es la única vía al menú lateral, y sin
    // esto había que scrollear hasta el tope de una agenda larga para poder
    // cambiar de sección. En escritorio el menú está siempre a la vista, así que
    // la barra sigue scrolleando y no se come 56px de alto.
    // `z-30` la deja por debajo del drawer y de los modales (`z-50`).
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b bg-card px-4 sm:px-6 md:static">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav role={role} features={features} email={email} />
        <span className="truncate font-semibold">{orgName}</span>
      </div>
      {/*
        En mobile a la derecha quedan la campanita y el tema, los dos como un
        icono suelto. "Cerrar sesión" y el email son texto y se comían media
        barra, así que esos sí viven en el menú hamburguesa. Estos dos no: la
        campanita es un indicador con estado —lleva el contador de no leídas— y
        el tema es de un toque, esconderlo detrás de un menú lo volvía un viaje.
      */}
      <div className="flex shrink-0 items-center gap-2">
        <DashboardNotifications />
        <ThemeToggleButton className="md:hidden" />
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
