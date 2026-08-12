import { AppFooter, ThemeToggle } from '@agendox/ui';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-muted/30">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center p-4">{children}</div>
      <AppFooter />
    </div>
  );
}
