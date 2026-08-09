import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicOrg } from '@/lib/api/public';
import { brandThemeVars } from '@/lib/theme';

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

  const accent = org.branding.primaryColor ?? '#2563eb';
  const themeVars = brandThemeVars(org.branding.primaryColor, org.branding.secondaryColor);

  return (
    <div className="min-h-screen" style={themeVars}>
      <div style={{ backgroundColor: accent }} className="h-1.5 w-full" />
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
          <div>
            <p className="font-semibold">{org.branding.publicTitle || org.name}</p>
            {org.branding.publicDescription ? (
              <p className="text-xs text-muted-foreground">
                {org.branding.publicDescription}
              </p>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
