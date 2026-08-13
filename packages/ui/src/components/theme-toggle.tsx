'use client';

import * as React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

import { cn } from '../lib/utils';
import { useTheme, type ThemePreference } from './theme-provider';

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', Icon: Sun },
  { value: 'dark', label: 'Oscuro', Icon: Moon },
  { value: 'system', label: 'Automático', Icon: Monitor },
];

/**
 * Selector de tema de tres estados (claro / oscuro / seguir al sistema).
 * Se renderiza como un grupo de radio para que sea navegable por teclado y
 * anunciable por lectores de pantalla.
 *
 * Para barras angostas está {@link ThemeToggleButton}, que son los mismos tres
 * estados en un solo botón.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Tema de la interfaz"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md border border-input bg-background p-0.5',
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setPreference(value)}
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Los mismos tres estados que {@link ThemeToggle}, en **un solo botón** que
 * cicla claro → oscuro → automático.
 *
 * Existe para la barra superior en mobile: ahí los tres botones se comían el
 * ancho que necesita el nombre del negocio, y esconder el tema en el menú
 * hamburguesa lo dejaba pegado a "Cerrar sesión". El icono muestra la
 * preferencia actual, no el tema resuelto — si dice "automático" hay que poder
 * verlo, que es la diferencia entre "está en oscuro" y "sigue al sistema".
 */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();

  const index = Math.max(
    0,
    OPTIONS.findIndex((option) => option.value === preference),
  );
  const current = OPTIONS[index]!;
  const next = OPTIONS[(index + 1) % OPTIONS.length]!;
  const { Icon } = current;

  return (
    <button
      type="button"
      onClick={() => setPreference(next.value)}
      // El label lleva el estado actual y no solo la acción: es un botón que
      // cambia de significado en cada toque, y sin eso un lector de pantalla
      // nunca dice en qué tema está.
      aria-label={`Tema: ${current.label}. Cambiar a ${next.label.toLowerCase()}`}
      title={`Tema: ${current.label}`}
      // Mismo alto y mismo estilo sin borde que la campanita: en la barra los
      // dos se leen como un par de iconos y no como un control suelto.
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
