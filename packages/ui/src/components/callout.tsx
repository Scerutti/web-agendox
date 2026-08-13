import * as React from 'react';
import { AlertTriangle, Info, Lightbulb } from 'lucide-react';

import { cn } from '../lib/utils';

const ICONS = {
  info: Info,
  tip: Lightbulb,
  warning: AlertTriangle,
} as const;

const TONES = {
  info: 'border-border bg-muted/50 text-muted-foreground',
  tip: 'border-border bg-muted/50 text-muted-foreground',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200',
} as const;

export interface CalloutProps {
  tone?: keyof typeof ICONS;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Bloque de ayuda contextual para explicar un concepto antes de que el usuario
 * tenga que adivinarlo. Más grande que un {@link InfoHint}: este se usa cuando
 * la explicación es la primera cosa que hay que leer en la pantalla.
 */
export function Callout({ tone = 'info', title, children, className }: CalloutProps) {
  const Icon = ICONS[tone];
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-md border p-3 text-xs leading-relaxed',
        TONES[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      {/* `min-w-0`: sin esto el texto no puede encogerse por debajo de su
          palabra más larga (o de un link sin espacios) y desborda el ancho. */}
      <div className="min-w-0 space-y-1">
        {title ? <p className="font-medium text-foreground">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
