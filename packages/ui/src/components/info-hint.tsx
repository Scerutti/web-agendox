'use client';

import * as React from 'react';
import { Info } from 'lucide-react';

import { cn } from '../lib/utils';

export interface InfoHintProps {
  /** Texto de ayuda. Acepta nodos para poder resaltar o listar. */
  children: React.ReactNode;
  /** Etiqueta accesible del botón. Nombrá el campo que explica. */
  label?: string;
  /**
   * Lado al que se alinea el globo. Por defecto se decide al abrirlo según de
   * qué mitad de la pantalla salga el ícono, para que no se corte.
   */
  align?: 'start' | 'end';
  className?: string;
}

/**
 * Ícono de información con la ayuda al lado. En desktop se abre al pasar el
 * mouse o al enfocar con teclado; en touch, donde no existe el hover, se abre
 * al tocar. El hover se habilita solo si el dispositivo realmente lo soporta
 * (`hover: hover`), porque en mobile el navegador emula un `pointerenter` junto
 * al tap y el globo se abriría y cerraría en el mismo gesto.
 */
export function InfoHint({ children, label = 'Más información', align, className }: InfoHintProps) {
  const [open, setOpen] = React.useState(false);
  const [hoverCapable, setHoverCapable] = React.useState(false);
  // Lado calculado al abrir: el globo mide hasta 17rem y siempre nace pegado al
  // ícono, así que si el ícono cae en la mitad derecha hay que anclarlo a la
  // derecha o se sale de la pantalla (y en mobile eso se comía la vista).
  const [autoAlign, setAutoAlign] = React.useState<'start' | 'end'>('start');
  const side = align ?? autoAlign;
  const wrapperRef = React.useRef<HTMLSpanElement>(null);
  const bubbleId = React.useId();

  React.useEffect(() => {
    setHoverCapable(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const hoverHandlers = hoverCapable
    ? {
        onPointerEnter: (event: React.PointerEvent<HTMLButtonElement>) => {
          setAutoAlign(pickAlign(event.currentTarget));
          setOpen(true);
        },
        onPointerLeave: () => setOpen(false),
      }
    : {};

  return (
    <span ref={wrapperRef} className={cn('relative inline-flex align-middle', className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? bubbleId : undefined}
        onClick={(event) => {
          // El hint se usa dentro de `<label>` (en los checkboxes de
          // configuración): sin cortar la propagación, pedir la ayuda activaría
          // el control asociado a esa etiqueta.
          event.preventDefault();
          event.stopPropagation();
          setAutoAlign(pickAlign(event.currentTarget));
          setOpen((value) => !value);
        }}
        // No se abre al recibir el foco: el foco llega junto con el tap en touch,
        // y abrir ahí haría que el click siguiente lo cierre de inmediato. Con
        // teclado, Enter dispara el click y alcanza (patrón disclosure).
        onBlur={() => setOpen(false)}
        {...hoverHandlers}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </button>

      {open ? (
        <span
          id={bubbleId}
          role="tooltip"
          className={cn(
            'absolute top-6 z-50 w-[min(17rem,calc(100vw-2.5rem))] rounded-md border bg-popover p-2.5 text-xs font-normal leading-relaxed text-popover-foreground shadow-md',
            side === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}

/** Ancla el globo al lado que deja más aire hasta el borde de la pantalla. */
function pickAlign(anchor: HTMLElement): 'start' | 'end' {
  const { left } = anchor.getBoundingClientRect();
  return left > window.innerWidth / 2 ? 'end' : 'start';
}
