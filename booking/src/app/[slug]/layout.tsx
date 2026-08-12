import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppFooter, brandThemeVars, ThemeToggle } from '@agendox/ui';
import { getPublicOrg } from '@/lib/api/public';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = await getPublicOrg(slug);
  if (!org) return { title: 'Agendox' };
  return {
    title: org.branding.publicTitle || org.name,
    description: org.branding.publicDescription || undefined,
  };
}

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getPublicOrg(slug);
  if (!org) notFound();

  const themeVars = brandThemeVars(org.branding.primaryColor, org.branding.secondaryColor);

  return (
    // `brand-scope` es lo que hace que las variables de marca se apliquen, y que
    // se elija la variante clara u oscura del color según el tema activo.
    <div className="brand-scope flex min-h-screen flex-col" style={themeVars}>
      <div className="h-1.5 w-full bg-primary" />
      <header className="border-b">
        <div className="mx-auto flex max-w-2xl items-center gap-3 p-4">
          {org.branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.branding.logoUrl}
              alt={org.name}
              className="h-10 w-10 rounded object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{org.branding.publicTitle || org.name}</p>
            {org.branding.publicDescription ? (
              <p className="truncate text-xs text-muted-foreground">
                {org.branding.publicDescription}
              </p>
            ) : null}
          </div>
          <ThemeToggle className="shrink-0" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 p-4 sm:p-6">{children}</main>
      <AppFooter />
    </div>
  );
}
