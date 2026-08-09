'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, toast } from '@agendox/ui';
import { reactivateOrganization, suspendOrganization } from '../actions';

export function OrgActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: 'suspend' | 'reactivate') {
    setBusy(true);
    const res =
      action === 'suspend' ? await suspendOrganization(id) : await reactivateOrganization(id);
    setBusy(false);
    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  const suspended = status === 'SUSPENDED';
  return (
    <Button
      variant={suspended ? 'default' : 'destructive'}
      disabled={busy}
      onClick={() => run(suspended ? 'reactivate' : 'suspend')}
    >
      {busy ? 'Procesando…' : suspended ? 'Reactivar' : 'Suspender'}
    </Button>
  );
}
