// Service Worker de Web Push (booking).

// Un SW nuevo queda "waiting" hasta que se cierren todas las pestañas viejas.
// Para un worker que solo muestra notificaciones eso no aporta nada y sí genera
// el problema de que un deploy tarde días en tomar efecto.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Agendox', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Agendox';
  const url = data.url || '/';
  const options = {
    body: data.body || '',
    data: { url },
    tag: data.tag || undefined,
    icon: '/pwa-icon.svg',
    badge: '/pwa-icon.svg',
    // Con el mismo tag, `renotify` hace que la actualización vuelva a avisar en
    // vez de reemplazar la notificación en silencio.
    renotify: !!data.tag,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  const target = new URL(url, self.location.origin);

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // Si ya hay una pestaña abierta en el destino, se enfoca esa.
      const exact = list.find((client) => new URL(client.url).pathname === target.pathname);
      if (exact) return exact.focus();
      // Si hay alguna otra, se la lleva al destino en vez de abrir una nueva:
      // acumular pestañas del mismo sitio es lo que hace que esto moleste.
      const any = list[0];
      if (any && 'navigate' in any) {
        return any.focus().then((focused) => (focused || any).navigate(target.href));
      }
      return self.clients.openWindow(target.href);
    }),
  );
});
