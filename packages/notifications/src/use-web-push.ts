'use client';

import { useCallback, useEffect, useState } from 'react';
import { isWebPushSupported, urlBase64ToUint8Array } from './web-push';

export function useWebPush(basePath: string) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ok = isWebPushSupported();
    setSupported(ok);
    if (!ok) return;
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {});
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isWebPushSupported()) return false;
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return false;

      const reg = await navigator.serviceWorker.register('/sw.js');
      const res = await fetch(`${basePath}/push/vapid-public-key`);
      const { publicKey } = await res.json();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = sub.toJSON();
      await fetch(`${basePath}/push/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          userAgent: navigator.userAgent,
        }),
      });
      setSubscribed(true);
      return true;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }, [basePath]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    setBusy(true);
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

  return { supported, subscribed, busy, subscribe, unsubscribe };
}
