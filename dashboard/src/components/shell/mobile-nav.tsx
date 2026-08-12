'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@agendox/domain';
import { Button, Sheet, cn } from '@agendox/ui';
import { ROLE_LABEL } from '@/lib/org-ui';
import type { OrganizationFeatures } from '@/lib/api/types';
import { isActive, navFor } from './nav';

export function MobileNav({
  role,
  features,
}: {
  role: Role;
  features: OrganizationFeatures;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navFor(features, role);

  // Close the drawer whenever navigation completes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
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
                onClick={() => setOpen(false)}
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
      </Sheet>
    </div>
  );
}
