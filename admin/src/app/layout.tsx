import type { Metadata, Viewport } from 'next';
import { ThemeScript } from '@agendox/ui';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Agendox · Plataforma',
  description: 'Panel de super administración',
  applicationName: 'Agendox Plataforma',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
