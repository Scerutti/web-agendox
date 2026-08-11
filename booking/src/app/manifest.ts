import type { MetadataRoute } from 'next';

/**
 * Manifest de PWA del portal público. Igual que en el panel, es lo que habilita
 * el push en iOS (Safari exige que el sitio esté agregado a la pantalla de
 * inicio para entregar notificaciones).
 *
 * `start_url` queda en `/` y no en `/<slug>` porque un mismo dominio sirve a
 * todos los negocios; el slug lo pone la URL que el cliente abre.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Agendox · Reservas',
    short_name: 'Reservas',
    description: 'Reservá y gestioná tus turnos',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f766e',
    lang: 'es',
    dir: 'ltr',
    icons: [
      {
        src: '/pwa-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/pwa-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
