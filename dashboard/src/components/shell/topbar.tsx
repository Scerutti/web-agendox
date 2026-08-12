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
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav role={role} features={features} />
        <span className="truncate font-semibold">{orgName}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <DashboardNotifications />
        {/* El email es el acceso a la cuenta: es donde el usuario ya mira para
            saber con quién está entrado. En mobile queda el ícono. */}
        <Link
          href="/account"
          className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          title="Mi cuenta"
        >
          <span className="hidden sm:inline">{email}</span>
          <span className="sm:hidden" aria-hidden>
            ⚙
          </span>
          <span className="sr-only sm:hidden">Mi cuenta</span>
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
