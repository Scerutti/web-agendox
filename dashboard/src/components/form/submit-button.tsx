'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '@agendox/ui';

export function SubmitButton({
  children,
  pendingText,
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (pendingText ?? 'Guardando…') : children}
    </Button>
  );
}
