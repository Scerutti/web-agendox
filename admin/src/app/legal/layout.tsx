import Link from 'next/link';
import { AppFooter, ThemeToggle } from '@agendox/ui';

/**
 * Los documentos legales viven fuera del grupo `(app)`: se tienen que poder
 * leer sin sesión, porque el footer del login linkea acá.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight hover:underline">
          Agendox · Plataforma
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
      <AppFooter />
    </div>
  );
}

// Los documentos son estáticos, pero el año del copyright del footer se calcula
// al renderizar: sin esto quedaría congelado en la fecha del build.
export const revalidate = 86400;
