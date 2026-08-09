'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * Slide-in panel anchored to a screen edge (drawer). Shares the Dialog's
 * overlay + Escape/backdrop-close behavior; used for the dashboard's mobile
 * navigation. Defaults to the left edge.
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
          'absolute inset-y-0 flex w-72 max-w-[80vw] flex-col overflow-y-auto border-r bg-card p-4 shadow-lg',
          side === 'left' ? 'left-0' : 'right-0 border-l border-r-0',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
