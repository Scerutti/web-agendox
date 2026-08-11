import type { Metadata, Viewport } from 'next';
import { ThemeScript } from '@agendox/ui';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Agendox · Panel',
  description: 'Panel del negocio',
  applicationName: 'Agendox Panel',
  manifest: '/manifest.webmanifest',
  // El panel es privado: no tiene sentido que lo indexen.
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: 'Agendox', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  // Un color por tema para que la barra del navegador en mobile acompañe.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
