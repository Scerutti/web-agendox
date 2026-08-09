'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@agendox/ui';

const TABS = [
  { href: '/settings/business', label: 'Negocio' },
  { href: '/settings/hours', label: 'Horarios' },
  { href: '/settings/booking', label: 'Reservas' },
  { href: '/settings/payment', label: 'Seña / Pagos' },
  { href: '/settings/notifications', label: 'Notificaciones' },
  { href: '/settings/branding', label: 'Marca' },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 border-b">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            '-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground',
            pathname === t.href && 'border-primary text-foreground',
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
