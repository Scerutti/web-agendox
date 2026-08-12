'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Slide-in panel anchored to a screen edge (drawer). Shares the Dialog's
 * overlay + Escape/backdrop-close behavior and its explicit close button; used
 * for the dashboard's mobile navigation. Defaults to the left edge.
 */
export function Sheet({
  open,
  onOpenChange,
  side = 'left',
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'absolute inset-y-0 flex w-72 max-w-[80vw] flex-col border-r bg-card shadow-lg',
          side === 'left' ? 'left-0' : 'right-0 border-l border-r-0',
          className,
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Cerrar"
          className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        {/* El scroll va en el contenido para que la X quede fija. */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
