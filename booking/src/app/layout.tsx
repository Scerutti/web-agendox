import type { Metadata, Viewport } from 'next';
import { ThemeScript } from '@agendox/ui';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Agendox · Reservas',
  description: 'Reservá tu turno online',
  applicationName: 'Agendox Reservas',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Reservas', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
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
