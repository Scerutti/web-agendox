'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@agendox/domain';
import { cn } from '@agendox/ui';
import { ROLE_LABEL } from '@/lib/org-ui';
import type { OrganizationFeatures } from '@/lib/api/types';
import { isActive, navFor } from './nav';

export function Sidebar({
  role,
  features,
}: {
  role: Role;
  features: OrganizationFeatures;
}) {
  const pathname = usePathname();
  const items = navFor(features);

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card px-3 py-4 md:flex">
      <div className="px-3 pb-4">
        <span className="text-lg font-semibold tracking-tight">Agendox</span>
        <p className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</p>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) =>
          item.enabled ? (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                isActive(pathname, item.href) &&
                  'bg-accent text-accent-foreground',
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span
              key={item.href}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground/60"
              aria-disabled
            >
              {item.label}
              <span className="rounded bg-muted px-1.5 py-0.5 text-[0.6rem] uppercase">
                Pronto
              </span>
            </span>
          ),
        )}
      </nav>
    </aside>
  );
}
