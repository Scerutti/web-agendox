import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppFooter, ThemeToggle } from '@agendox/ui';
import { ApiError } from '@/lib/api/server';
import { getMe } from '@/lib/api/admin';
import { LogoutButton } from '@/components/logout-button';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let email: string;
  try {
    const me = await getMe();
    email = me.email;
  } catch (e) {
    if (e instanceof ApiError && e.isUnauthorized) redirect('/login');
    throw e;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/*
        En una sola fila esto no entra en un teléfono: el título más los dos
        links ya pasan los 350px, y el selector de tema son tres botones. Por
        debajo de `sm` se apila en dos filas — identidad arriba, navegación y
        controles abajo — en vez de desbordar.
      */}
      <header className="flex flex-col gap-2 border-b bg-card px-4 py-2 sm:h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-0">
        <div className="flex min-w-0 items-center justify-between gap-4 sm:justify-start">
          <span className="truncate font-semibold tracking-tight">
            Agendox · Plataforma
          </span>
          <span className="truncate text-xs text-muted-foreground sm:hidden">
            {email}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/" className="rounded-md px-3 py-2 font-medium hover:bg-accent">
              Métricas
            </Link>
            <Link
              href="/organizations"
              className="rounded-md px-3 py-2 font-medium hover:bg-accent"
            >
              Organizaciones
            </Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <span className="hidden text-sm text-muted-foreground lg:inline">{email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
      <AppFooter />
    </div>
  );
}
