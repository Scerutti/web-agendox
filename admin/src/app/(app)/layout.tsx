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
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="font-semibold tracking-tight">Agendox · Plataforma</span>
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
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
      <AppFooter />
    </div>
  );
}
