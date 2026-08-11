'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@agendox/ui';
import { FEATURE_UI, type OrganizationFeatures } from '@/lib/api/admin.types';
import { updateFeatures } from '../actions';

/**
 * Toggles de funcionalidad por organización. Cada cambio se guarda solo (no hay
 * botón de submit): es un panel de operación, y obligar a un "guardar" extra por
 * un switch suelto solo agrega un paso donde olvidarse.
 */
export function OrgFeaturesForm({
  id,
  features,
}: {
  id: string;
  features: OrganizationFeatures;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(features);
  const [pending, startTransition] = useTransition();

  function toggle(key: keyof OrganizationFeatures, value: boolean) {
    const previous = current;
    // Optimista: el switch responde al toque y se revierte si el guardado falla.
    setCurrent({ ...current, [key]: value });
    startTransition(async () => {
      const res = await updateFeatures(id, { [key]: value });
      if (res.ok) {
        router.refresh();
      } else {
        setCurrent(previous);
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="space-y-3">
      {FEATURE_UI.map(({ key, label, hint }) => (
        <label key={key} className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={current[key]}
            disabled={pending}
            onChange={(event) => toggle(key, event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium">{label}</span>
            <span className="block text-xs text-muted-foreground">{hint}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
