'use client';

import { useState } from 'react';
import { Button, InfoHint, NotificationBell, cn, toast } from '@agendox/ui';
import { useNotifications } from './use-notifications';
import { useWebPush, WEB_PUSH_ERROR_MESSAGES } from './use-web-push';
import type { FeedItem } from './types';

export function NotificationCenter({
  basePath,
  onNewItems,
}: {
  basePath: string;
  onNewItems?: (items: FeedItem[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, markRead } = useNotifications({
    basePath,
    onNewItems: (fresh) => {
      fresh.forEach((f) => toast(f.title, { description: f.body }));
      onNewItems?.(fresh);
    },
  });
  const push = useWebPush(basePath);

  async function togglePush() {
    if (push.subscribed) {
      await push.unsubscribe();
      toast.success('Notificaciones del navegador desactivadas');
      return;
    }
    const ok = await push.subscribe();
    if (ok) {
      toast.success('Notificaciones del navegador activadas');
      return;
    }
    // Sin esto el usuario solo veía que "no pasó nada": el toaster in-app seguía
    // funcionando y la notificación del sistema nunca llegaba, sin explicación.
    toast.error(
      push.error
        ? WEB_PUSH_ERROR_MESSAGES[push.error]
        : 'No se pudieron activar las notificaciones del navegador.',
    );
  }

  return (
    <div className="relative">
      <NotificationBell count={unreadCount} onClick={() => setOpen((o) => !o)} />
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between gap-2 border-b p-3">
              <span className="text-sm font-semibold">Notificaciones</span>
              {push.supported ? (
                <Button variant="ghost" size="sm" disabled={push.busy} onClick={togglePush}>
                  {push.busy
                    ? 'Un momento…'
                    : push.subscribed
                      ? 'Desactivar push'
                      : 'Activar push'}
                </Button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  Push no disponible
                  <InfoHint label="Por qué no está disponible el push" align="end">
                    Este navegador no soporta notificaciones del sistema. En iPhone o
                    iPad hay que agregar el sitio a la pantalla de inicio (Compartir →
                    Agregar a inicio) y abrirlo desde ahí.
                  </InfoHint>
                </span>
              )}
            </div>
            {push.error ? (
              <p className="border-b bg-muted/50 p-3 text-xs text-muted-foreground">
                {WEB_PUSH_ERROR_MESSAGES[push.error]}
              </p>
            ) : null}
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  Sin notificaciones.
                </p>
              ) : (
                items.slice(0, 20).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => n.readAt || markRead(n.id)}
                    className={cn(
                      'flex w-full gap-2 border-b p-3 text-left last:border-0 hover:bg-accent',
                      !n.readAt && 'bg-accent/40',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                        n.readAt ? 'bg-transparent' : 'bg-primary',
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{n.title}</span>
                      {n.body ? (
                        <span className="block text-xs text-muted-foreground">
                          {n.body}
                        </span>
                      ) : null}
                      <span className="mt-0.5 block text-[0.65rem] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
