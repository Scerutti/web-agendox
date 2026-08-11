'use client';

import { useCallback, useEffect, useState } from 'react';
import { isWebPushSupported, urlBase64ToUint8Array } from './web-push';

/** Por qué no se pudo activar el push. Cada caso se le explica distinto al usuario. */
export type WebPushError =
  /** El navegador no soporta Web Push (Safari sin instalar como app, por ejemplo). */
  | 'unsupported'
  /** El usuario rechazó el permiso, o lo tiene bloqueado para el sitio. */
  | 'permission-denied'
  /** El servidor no tiene las claves VAPID cargadas: no lo puede resolver el usuario. */
  | 'server-not-configured'
  /** El registro del Service Worker falló. */
  | 'service-worker-failed'
  /** Falló el guardado de la suscripción en el backend. */
  | 'subscribe-failed';

export const WEB_PUSH_ERROR_MESSAGES: Record<WebPushError, string> = {
  unsupported:
    'Tu navegador no soporta notificaciones. En iPhone, agregá el sitio a la pantalla de inicio y volvé a intentar.',
  'permission-denied':
    'Bloqueaste las notificaciones para este sitio. Habilitalas desde los permisos del navegador y volvé a intentar.',
  'server-not-configured':
    'Las notificaciones push todavía no están configuradas en el servidor. Avisale al equipo de Agendox.',
  'service-worker-failed': 'No se pudo iniciar el servicio de notificaciones. Recargá la página.',
  'subscribe-failed': 'No se pudo guardar la suscripción. Probá de nuevo en un momento.',
};

export interface UseWebPushResult {
  supported: boolean;
  subscribed: boolean;
  busy: boolean;
  /** Último error, para poder mostrar algo más útil que "no se pudo". */
  error: WebPushError | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
}

export function useWebPush(basePath: string): UseWebPushResult {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<WebPushError | null>(null);

  useEffect(() => {
    const ok = isWebPushSupported();
    setSupported(ok);
    if (!ok) return;

    // Registrar el SW al cargar, no al suscribirse: así una suscripción que ya
    // existe se detecta apenas entra el usuario, y el primer click en "activar"
    // no tiene que esperar la instalación del worker.
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {
        // Un SW que no registra no es fatal: el resto de la app funciona y el
        // error real se reporta cuando el usuario intenta activar el push.
      });
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isWebPushSupported()) {
      setError('unsupported');
      return false;
    }
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('permission-denied');
        return false;
      }

      let registration: ServiceWorkerRegistration;
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
      } catch {
        setError('service-worker-failed');
        return false;
      }

      // El backend responde `configured: false` cuando le faltan las claves
      // VAPID. Sin este chequeo, `publicKey` viene vacío, `subscribe()` explota
      // con un error de formato y el síntoma no dice nada de la causa.
      const res = await fetch(`${basePath}/push/vapid-public-key`);
      if (!res.ok) {
        setError('server-not-configured');
        return false;
      }
      const { publicKey, configured } = (await res.json()) as {
        publicKey?: string;
        configured?: boolean;
      };
      if (configured === false || !publicKey) {
        setError('server-not-configured');
        return false;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON();
      const saved = await fetch(`${basePath}/push/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          userAgent: navigator.userAgent,
        }),
      });
      if (!saved.ok) {
        // La suscripción quedó en el navegador pero no en el backend: se
        // deshace, o queda un estado donde la UI dice "activado" y nunca llega
        // ninguna notificación.
        await sub.unsubscribe().catch(() => undefined);
        setError('subscribe-failed');
        return false;
      }

      setSubscribed(true);
      return true;
    } catch {
      setError('subscribe-failed');
      return false;
    } finally {
      setBusy(false);
    }
  }, [basePath]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch(`${basePath}/push/subscriptions`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  }, [basePath]);

  return { supported, subscribed, busy, error, subscribe, unsubscribe };
}
