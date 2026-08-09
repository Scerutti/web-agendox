'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@agendox/ui';

export function PortalLogoutButton({ slug }: { slug: string }) {
  const router = useRouter();
  async function onClick() {
    await fetch(`/api/portal/${slug}/logout`, { method: 'POST' });
    router.push(`/${slug}`);
    router.refresh();
  }
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      Salir
    </Button>
  );
}
