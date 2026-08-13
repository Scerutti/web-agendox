'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  // El portal necesita `document`, que no existe en el render del servidor.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open || !mounted) return null;

  // Va montado en `body` y no donde se lo invoca: si no, cualquier ancestro con
  // `opacity`, `transform` u `overflow` se lo lleva puesto — le hereda la
  // transparencia, lo recorta o lo mete adentro de un scroll horizontal. Pasaba
  // con el modal disparado desde una fila de tabla.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col rounded-lg border bg-card shadow-lg"
      >
        <CloseButton onClick={() => onOpenChange(false)} />
        {/*
          El scroll vive en el contenido, no en el panel. Si scrolleara el panel,
          la X —que está posicionada sobre él— se iría de pantalla apenas el
          usuario bajara en un modal largo, que es justo cuando más se necesita.
        */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Cierre explícito del modal. El clic afuera y Escape ya cerraban, pero son
 * gestos que no se ven: sin un control visible, el usuario no sabe que existen.
 */
function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cerrar"
      className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <X className="h-4 w-4" aria-hidden />
    </button>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  // `pr-12` reserva el ancho del botón de cierre para que el título no quede
  // debajo de la X.
  return <div className={cn('mb-4 space-y-1 pr-12', className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-lg font-semibold', className)} {...props} />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-6 flex justify-end gap-2', className)}
      {...props}
    />
  );
}
