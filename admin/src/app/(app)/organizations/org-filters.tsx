'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@agendox/ui';

const selectClass =
  'h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const STATUSES = [
  { value: '', label: 'Todos los estados' },
  { value: 'TRIAL', label: 'Prueba' },
  { value: 'ACTIVE', label: 'Activa' },
  { value: 'SUSPENDED', label: 'Suspendida' },
  { value: 'DISABLED', label: 'Deshabilitada' },
];

export function OrgFilters({ status, q }: { status: string; q: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function apply(next: { status?: string; q?: string }) {
    const sp = new URLSearchParams(params.toString());
    const setOrDelete = (key: string, value: string) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    };
    if (next.status !== undefined) setOrDelete('status', next.status);
    if (next.q !== undefined) setOrDelete('q', next.q);
    router.push(`/organizations?${sp.toString()}`);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get('q');
    apply({ q: typeof value === 'string' ? value : '' });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <Input
          name="q"
          placeholder="Buscar por nombre o slug…"
          defaultValue={q}
          className="w-64 max-w-full"
        />
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
      </form>
      <select
        className={selectClass}
        value={status}
        onChange={(e) => apply({ status: e.target.value })}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
