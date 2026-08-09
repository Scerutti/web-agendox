'use client';

import { useRouter } from 'next/navigation';
import { NotificationCenter } from '@agendox/notifications';

export function PortalNotifications({ slug }: { slug: string }) {
  const router = useRouter();
  return (
    <NotificationCenter
      basePath={`/api/portal/${slug}`}
      onNewItems={() => router.refresh()}
    />
  );
}
