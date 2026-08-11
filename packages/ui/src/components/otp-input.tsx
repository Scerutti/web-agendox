'use client';

import * as React from 'react';

import { cn } from '../lib/utils';

export interface OtpInputProps {
  /** Nombre del campo oculto que viaja en el submit con el código completo. */
  name: string;
  length?: number;
  disabled?: boolean;
  /** Enfoca la primera casilla al montar. */
  autoFocus?: boolean;
  /**
   * Envía el form que contiene al input en cuanto se completan los dígitos.
   * Es lo que espera cualquiera que pega un código: no tener que apretar nada.
   */
  autoSubmit?: boolean;
  onComplete?: (code: string) => void;
  /** Se dispara en cada tecla, con el código parcial. */
  onChange?: (code: string) => void;
  className?: string;
}

/**
 * Campo de código de un solo uso en casillas separadas, una por dígito.
 *
 * Soporta lo que la gente hace de verdad con estos códigos: pegarlo completo
 * (se reparte entre las casillas), corregir con backspace (vuelve a la casilla
 * anterior), moverse con las flechas, y que al completar el último dígito se
 * envíe solo. El valor real viaja en un input oculto, así el form sigue siendo
 * nativo.
 */
export function OtpInput({
  name,
  length = 6,
  disabled,
  autoFocus,
  autoSubmit = true,
  onComplete,
  onChange: onCodeChange,
  className,
}: OtpInputProps) {
  const [digits, setDigits] = React.useState<string[]>(() => Array.from({ length }, () => ''));
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const hiddenRef = React.useRef<HTMLInputElement>(null);
  const code = digits.join('');
  const completeRef = React.useRef(false);

  React.useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  React.useEffect(() => {
    onCodeChange?.(code);
    // `onCodeChange` queda fuera de las deps a propósito: los padres suelen
    // pasar una lambda nueva en cada render y esto se volvería un bucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Dispara una sola vez por código completo: sin el guard, cada re-render con
  // los 6 dígitos puestos volvería a enviar el form.
  React.useEffect(() => {
    if (code.length !== length) {
      completeRef.current = false;
      return;
    }
    if (completeRef.current) return;
    completeRef.current = true;
    onComplete?.(code);
    if (autoSubmit) hiddenRef.current?.form?.requestSubmit();
  }, [code, length, autoSubmit, onComplete]);

  function setDigit(index: number, value: string) {
    setDigits((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  function focusAt(index: number) {
    inputsRef.current[Math.min(Math.max(index, 0), length - 1)]?.focus();
  }

  function onChange(index: number, raw: string) {
    const digitsOnly = raw.replace(/\D/g, '');
    if (!digitsOnly) {
      setDigit(index, '');
      return;
    }
    // Varios dígitos en una casilla (autocompletado del SMS, pegado sobre el
    // campo): se reparten desde acá en adelante.
    if (digitsOnly.length > 1) {
      fill(digitsOnly, index);
      return;
    }
    setDigit(index, digitsOnly);
    if (index < length - 1) focusAt(index + 1);
  }

  function fill(value: string, from: number) {
    const chars = value.slice(0, length - from).split('');
    setDigits((current) => {
      const next = [...current];
      chars.forEach((char, offset) => {
        next[from + offset] = char;
      });
      return next;
    });
    focusAt(from + chars.length);
  }

  function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        setDigit(index, '');
        return;
      }
      // Casilla vacía: borra la anterior y se para ahí.
      event.preventDefault();
      if (index > 0) {
        setDigit(index - 1, '');
        focusAt(index - 1);
      }
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    }
  }

  function onPaste(index: number, event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    event.preventDefault();
    fill(pasted, index);
  }

  return (
    <div className={cn('flex items-center gap-1.5 sm:gap-2', className)}>
      <input ref={hiddenRef} type="hidden" name={name} value={code} />
      {digits.map((digit, index) => (
        <input
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Dígito ${index + 1} de ${length}`}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => onChange(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => onPaste(index, event)}
          onFocus={(event) => event.target.select()}
          className="h-12 w-full min-w-0 max-w-12 rounded-md border border-input bg-background text-center text-lg font-semibold tabular-nums ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      ))}
    </div>
  );
}
