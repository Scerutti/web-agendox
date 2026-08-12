import { Heart } from 'lucide-react';

import { cn } from '../lib/utils';

const AUTHOR_NAME = 'Seba Cerutti';
const AUTHOR_URL = 'https://www.linkedin.com/in/cerutti-sebastiáng';

export interface AppFooterProps {
  className?: string;
}

/**
 * Pie de página común a las tres apps: autoría, links legales y copyright.
 *
 * El año se calcula en el servidor. En las pantallas dinámicas sale del reloj de
 * quien sirve la página; las páginas legales, que son estáticas, se revalidan a
 * diario por eso mismo (ver el `revalidate` de `app/legal/layout.tsx`).
 */
export function AppFooter({ className }: AppFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn('border-t px-4 py-4 sm:px-6', className)}>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-1.5 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:gap-4 sm:text-left">
        <p className="flex items-center gap-1.5">
          <span>Hecho con</span>
          <Heart
            className="h-3.5 w-3.5 shrink-0 fill-current text-primary"
            aria-hidden
          />
          <span> por</span>
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {AUTHOR_NAME}
          </a>
        </p>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {/* Rutas relativas: las tres apps exponen las mismas, así el footer
              sirve igual en cualquiera sin recibir la base por prop. */}
          <a href="/legal/terms" className="underline-offset-4 hover:underline">
            Términos y Condiciones
          </a>
          <a href="/legal/privacy" className="underline-offset-4 hover:underline">
            Privacidad
          </a>
          <span>© {year} Agendox. Todos los derechos reservados.</span>
        </p>
      </div>
    </footer>
  );
}
