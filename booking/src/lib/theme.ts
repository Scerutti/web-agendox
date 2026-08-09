import type { CSSProperties } from 'react';

/**
 * Convierte un color de marca (#RRGGBB o #RGB) a variables de theming HSL para
 * sobreescribir los tokens de `@agendox/ui` en el subtree público de un negocio.
 * Devuelve un objeto de `style` con custom properties CSS; si el color es
 * inválido/ausente, no aporta esa variable (quedan los defaults).
 */
export function brandThemeVars(
  primary?: string | null,
  secondary?: string | null,
): CSSProperties {
  const vars: Record<string, string> = {};

  const primaryHsl = hexToHslTriplet(primary);
  if (primaryHsl) {
    vars['--primary'] = primaryHsl.triplet;
    vars['--primary-foreground'] = foregroundFor(primaryHsl.luminance);
    vars['--ring'] = primaryHsl.triplet;
  }

  const secondaryHsl = hexToHslTriplet(secondary);
  if (secondaryHsl) {
    vars['--secondary'] = secondaryHsl.triplet;
    vars['--secondary-foreground'] = foregroundFor(secondaryHsl.luminance);
  }

  return vars as CSSProperties;
}

interface HslTriplet {
  /** `"H S% L%"`, listo para `hsl(var(--token))`. */
  triplet: string;
  /** Luminancia percibida 0–1, para elegir el color de texto de contraste. */
  luminance: number;
}

/** Contraste sobre un fondo de esa luminancia: casi-blanco o casi-negro. */
function foregroundFor(luminance: number): string {
  return luminance > 0.6 ? '222.2 47.4% 11.2%' : '210 40% 98%';
}

function hexToHslTriplet(hex?: string | null): HslTriplet | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const { r, g, b } = rgb;
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const triplet = `${round(h)} ${round(s * 100)}% ${round(l * 100)}%`;
  return { triplet, luminance };
}

function parseHex(hex?: string | null): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  let value = hex.trim().replace(/^#/, '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
