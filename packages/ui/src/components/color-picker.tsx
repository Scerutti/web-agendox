'use client';

import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '../lib/utils';

export interface ColorPickerProps {
  /** Nombre del campo que viaja en el submit del form. */
  name: string;
  id?: string;
  /** Hex inicial (`#RRGGBB`). Vacío o inválido arranca sin color. */
  defaultValue?: string | null;
  /** Color del swatch cuando todavía no se eligió nada. */
  fallback?: string;
  disabled?: boolean;
  className?: string;
  /** Permite dejar el campo sin color (muestra el botón de limpiar). */
  clearable?: boolean;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Selector de color compacto: un swatch que abre el picker nativo del sistema
 * más el hex editable al lado, para quien lo quiera pegar a mano. El valor que
 * se envía es el del campo de texto, así que el form sigue siendo un form
 * nativo (sin JS del lado del submit).
 *
 * Se apoya en `input type="color"` a propósito: es el picker que el usuario ya
 * conoce, funciona en mobile y no agrega dependencias ni peso al bundle.
 */
export function ColorPicker({
  name,
  id,
  defaultValue,
  fallback = '#2563eb',
  disabled,
  className,
  clearable = true,
}: ColorPickerProps) {
  const initial = normalize(defaultValue);
  const [value, setValue] = React.useState(initial);
  const textId = id ?? name;
  const textRef = React.useRef<HTMLInputElement>(null);

  // El componente es controlado, así que `form.reset()` no lo alcanza solo: sin
  // esto, un formulario de alta que se limpia tras guardar se queda con el color
  // del registro anterior.
  React.useEffect(() => {
    const form = textRef.current?.form;
    if (!form) return;
    const onReset = () => setValue(initial);
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, [initial]);

  // El picker nativo no admite vacío: cuando no hay color elegido muestra el
  // fallback, pero el campo de texto sigue vacío para no inventar un valor.
  const swatch = HEX.test(value) ? value : fallback;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'relative inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-md border border-input',
          disabled && 'opacity-50',
        )}
        style={{ backgroundColor: swatch }}
      >
        <input
          type="color"
          aria-label="Elegir color"
          value={swatch}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          className="h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </span>

      <input
        ref={textRef}
        id={textId}
        name={name}
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        placeholder={fallback}
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        className="h-9 w-24 rounded-md border border-input bg-background px-2 font-mono text-xs uppercase ring-offset-background placeholder:text-muted-foreground placeholder:normal-case focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />

      {clearable && value ? (
        <button
          type="button"
          onClick={() => setValue('')}
          disabled={disabled}
          aria-label="Quitar color"
          title="Quitar color"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

function normalize(value?: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return HEX.test(withHash) ? withHash.toLowerCase() : '';
}
