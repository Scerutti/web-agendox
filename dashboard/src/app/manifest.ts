import type { MetadataRoute } from 'next';

/**
 * Manifest de PWA. Además de permitir instalar el panel, es **requisito** para
 * que las notificaciones push funcionen en iOS: Safari solo entrega push a un
 * sitio agregado a la pantalla de inicio, y para eso necesita un manifest con
 * `display: standalone`. En Android/Chrome el push funciona sin esto, pero el
 * manifest le da el ícono y el nombre correctos.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Agendox · Panel del negocio',
    short_name: 'Agendox',
    description: 'Gestión de turnos, recursos y clientes',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
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
