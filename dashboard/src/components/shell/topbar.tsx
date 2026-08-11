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
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {email}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
