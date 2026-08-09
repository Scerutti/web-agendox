'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, toast } from '@agendox/ui';

const DEFAULT_TZ = 'America/Argentina/Buenos_Aires';

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      organizationName: String(form.get('organizationName') ?? ''),
      slug: String(form.get('slug') ?? ''),
      timezone: String(form.get('timezone') ?? DEFAULT_TZ),
      owner: {
        firstName: String(form.get('firstName') ?? ''),
        lastName: String(form.get('lastName') ?? ''),
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      },
    };

    setLoading(true);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(data.message || 'No se pudo registrar el negocio');
        return;
      }
      if (data.registered && !data.user) {
        toast.success('Negocio registrado. Iniciá sesión.');
        router.push('/login');
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="organizationName">Nombre del negocio</Label>
        <Input id="organizationName" name="organizationName" required />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL pública)</Label>
          <Input
            id="slug"
            name="slug"
            required
            pattern="[a-z0-9-]{3,63}"
            placeholder="mi-negocio"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Zona horaria</Label>
          <Input id="timezone" name="timezone" defaultValue={DEFAULT_TZ} required />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña (mín. 8)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          autoComplete="new-password"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creando…' : 'Crear negocio'}
      </Button>
    </form>
  );
}
