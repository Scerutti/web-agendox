'use client';

import { useEffect, useRef } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { FeedItem } from './types';

export interface UseNotificationsOptions {
  /** '/api' en dashboard, '/api/portal/<slug>' en booking. */
  basePath: string;
  pollMs?: number;
  onNewItems?: (items: FeedItem[]) => void;
}

export function useNotifications({
  basePath,
  pollMs = 20000,
  onNewItems,
}: UseNotificationsOptions) {
  const qc = useQueryClient();
  const seen = useRef<Set<string> | null>(null);

  const feed = useQuery({
    queryKey: ['notifications', basePath],
    queryFn: async (): Promise<FeedItem[]> => {
      const r = await fetch(`${basePath}/notifications`, { cache: 'no-store' });
      if (!r.ok) throw new Error('feed');
      return r.json();
    },
    refetchInterval: pollMs,
  });

  const unread = useQuery({
    queryKey: ['notifications-unread', basePath],
    queryFn: async (): Promise<number> => {
      const r = await fetch(`${basePath}/notifications/unread-count`, {
        cache: 'no-store',
      });
      if (!r.ok) throw new Error('unread');
      const data = await r.json();
      return typeof data.count === 'number' ? data.count : 0;
    },
    refetchInterval: pollMs,
  });

  // Detecta ítems nuevos entre polls (no en la primera carga) y avisa.
  useEffect(() => {
    const items = feed.data;
    if (!items) return;
    if (seen.current === null) {
      seen.current = new Set(items.map((i) => i.id));
      return;
    }
    const fresh = items.filter((i) => !seen.current!.has(i.id));
    if (fresh.length) {
      fresh.forEach((i) => seen.current!.add(i.id));
      onNewItems?.(fresh);
    }
  }, [feed.data, onNewItems]);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${basePath}/notifications/${id}/read`, { method: 'POST' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', basePath] });
      qc.invalidateQueries({ queryKey: ['notifications-unread', basePath] });
    },
  });

  return {
    items: feed.data ?? [],
    unreadCount: unread.data ?? 0,
    isLoading: feed.isLoading,
    markRead: (id: string) => markRead.mutate(id),
  };
}
