'use client';

import { useRouter } from 'next/navigation';
import { NotificationCenter } from '@agendox/notifications';

export function DashboardNotifications() {
  const router = useRouter();
  // Al llegar notificaciones nuevas, refrescamos las vistas RSC
  // (calendario/turnos/señas) para reflejar los cambios.
  return (
    <NotificationCenter basePath="/api" onNewItems={() => router.refresh()} />
  );
}
