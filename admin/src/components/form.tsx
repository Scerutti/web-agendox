'use client';

import { useFormStatus } from 'react-dom';
import { Button, InfoHint, Label } from '@agendox/ui';

export function Field({
  label,
  htmlFor,
  hint,
  info,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  /** Ayuda larga: va detrás de un ícono para no ensuciar el formulario. */
  info?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={htmlFor}>{label}</Label>
        {info ? <InfoHint label={`Qué es ${label}`}>{info}</InfoHint> : null}
      </div>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Botón de submit que se deshabilita solo mientras corre la server action. */
export function SubmitButton({
  children,
  pendingLabel = 'Guardando…',
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
