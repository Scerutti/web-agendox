import * as React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '../lib/utils';

export interface NotificationBellProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Cantidad de no-leídas (alimentada por polling en FM5). */
  count?: number;
}

/**
 * Campanita presentacional con badge de no-leídas. La lógica de feed/polling
 * se cablea en FM5 (package @agendox/notifications).
 */
export const NotificationBell = React.forwardRef<
  HTMLButtonElement,
  NotificationBellProps
>(({ count = 0, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={
      count > 0 ? `Notificaciones: ${count} sin leer` : 'Notificaciones'
    }
    className={cn(
      'relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className,
    )}
    {...props}
  >
    <Bell className="h-5 w-5" />
    {count > 0 && (
      <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-destructive px-1 text-[0.65rem] font-semibold leading-4 text-destructive-foreground">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </button>
));
NotificationBell.displayName = 'NotificationBell';
