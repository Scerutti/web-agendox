'use client';

import { useState } from 'react';
import { Button, NotificationBell, cn, toast } from '@agendox/ui';
import { useNotifications } from './use-notifications';
import { useWebPush } from './use-web-push';
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
            <div className="flex items-center justify-between border-b p-3">
              <span className="text-sm font-semibold">Notificaciones</span>
              {push.supported && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={push.busy}
                  onClick={() =>
                    push.subscribed ? push.unsubscribe() : push.subscribe()
                  }
                >
                  {push.subscribed ? 'Desactivar push' : 'Activar push'}
                </Button>
              )}
            </div>
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
