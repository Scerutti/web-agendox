'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { TermsDocument } from '@agendox/legal';
import { Button, toast } from '@agendox/ui';
import { acceptTerms } from '@/app/(app)/legal-actions';

/**
 * Aceptación de los Términos y Condiciones antes de operar.
 *
 * Es intencionalmente bloqueante y **no** usa el `Dialog` compartido: ese se
 * cierra con Escape y con click en el fondo, que es exactamente lo que acá no
 * puede pasar. Tampoco hay botón de "después": la aceptación es la condición
 * para usar el servicio, y un modal que se puede saltear no prueba nada.
 *
 * La salida sin aceptar es cerrar sesión, que sí se ofrece.
 */
export function TermsGate({ version }: { version: string }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [pending, startTransition] = useTransition();

  // El route handler de logout solo acepta POST, así que no puede ser un link.
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  function submit() {
    startTransition(async () => {
      const res = await acceptTerms();
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg border bg-card shadow-lg">
        <header className="space-y-1 border-b p-4 sm:p-6">
          <h2 id="terms-gate-title" className="text-lg font-semibold tracking-tight">
            Antes de empezar, necesitamos tu aceptación
          </h2>
          <p className="text-sm text-muted-foreground">
            Estos son los términos del servicio, incluido cómo tratamos los datos de tus
            clientes. Se muestran una sola vez: quedan aceptados hasta que cambie el
            documento.
          </p>
        </header>

        {/* El documento scrollea dentro del modal, no la página de atrás. */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <TermsDocument />
        </div>

        <footer className="space-y-3 border-t p-4 sm:p-6">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-input"
            />
            <span>
              Leí y acepto los Términos y Condiciones y su Anexo I sobre tratamiento de
              datos personales, en nombre del negocio que represento.
            </span>
          </label>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Versión {version} · si preferís no aceptar, podés{' '}
              <button
                type="button"
                onClick={logout}
                className="underline underline-offset-4 hover:text-foreground"
              >
                cerrar sesión
              </button>
              .
            </p>
            <Button onClick={submit} disabled={!checked || pending}>
              {pending ? 'Registrando…' : 'Acepto y continúo'}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
