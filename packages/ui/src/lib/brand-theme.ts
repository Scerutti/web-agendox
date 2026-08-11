import type { CSSProperties } from 'react';

/**
 * Traduce los colores de marca de una organización a variables CSS que
 * sobreescriben los tokens de theming en un subtree.
 *
 * El problema que resuelve: el cliente elige un color pensando en fondo claro.
 * Ese mismo color sobre el fondo oscuro puede quedar invisible (un azul marino
 * sobre casi-negro) o vibrar y cansar la vista (un amarillo saturado al 100%).
 * Por eso no emitimos el color crudo: emitimos **dos** variantes por color,
 * cada una con la luminosidad y saturación llevadas a la banda que funciona en
 * su tema, y `tokens.css` elige cuál usar según haya `.dark` o no.
 *
 * El matiz (hue) siempre se respeta — es lo que la marca reconoce como "su"
 * color. Lo que se ajusta es cuán claro y cuán saturado se muestra.
 */
export function brandThemeVars(
  primary?: string | null,
  secondary?: string | null,
): CSSProperties {
  const vars: Record<string, string> = {};

  const primaryHsl = hexToHsl(primary);
  if (primaryHsl) {
    const light = clamp(primaryHsl, ACCENT_LIGHT);
    const dark = clamp(primaryHsl, ACCENT_DARK);
    vars['--brand-primary-light'] = triplet(light);
    vars['--brand-primary-light-fg'] = foregroundFor(light);
    vars['--brand-primary-dark'] = triplet(dark);
    vars['--brand-primary-dark-fg'] = foregroundFor(dark);
  }

  const secondaryHsl = hexToHsl(secondary);
  if (secondaryHsl) {
    const light = clamp(secondaryHsl, SURFACE_LIGHT);
    const dark = clamp(secondaryHsl, SURFACE_DARK);
    vars['--brand-secondary-light'] = triplet(light);
    vars['--brand-secondary-light-fg'] = foregroundFor(light);
    vars['--brand-secondary-dark'] = triplet(dark);
    vars['--brand-secondary-dark-fg'] = foregroundFor(dark);
  }

  return vars as CSSProperties;
}

/**
 * Color de marca crudo, sin ajustar, para adornos donde el color es el punto y
 * no hay texto encima (la franja superior de la página pública, por ejemplo).
 * Devuelve `null` si el hex es inválido, para poder caer al token por defecto.
 */
export function rawBrandColor(hex?: string | null): string | null {
  return hexToHsl(hex) ? normalizeHex(hex as string) : null;
}

interface Hsl {
  /** 0–360 */
  h: number;
  /** 0–100 */
  s: number;
  /** 0–100 */
  l: number;
}

interface Band {
  minL: number;
  maxL: number;
  maxS: number;
  minS: number;
}

/* El acento pinta botones con texto encima: en claro tiene que ser lo bastante
   oscuro para sostener texto blanco; en oscuro, lo bastante claro para
   destacarse del fondo. La saturación se techa para que no vibre. */
const ACCENT_LIGHT: Band = { minL: 32, maxL: 52, minS: 22, maxS: 88 };
const ACCENT_DARK: Band = { minL: 58, maxL: 74, minS: 20, maxS: 78 };

/* El secundario es una superficie (chips, fondos suaves), no un acento: se
   mantiene el matiz pero la luminosidad va a la banda de superficie del tema. */
const SURFACE_LIGHT: Band = { minL: 88, maxL: 96, minS: 8, maxS: 42 };
const SURFACE_DARK: Band = { minL: 15, maxL: 24, minS: 8, maxS: 38 };

function clamp({ h, s, l }: Hsl, band: Band): Hsl {
  return {
    h,
    s: Math.min(Math.max(s, band.minS), band.maxS),
    l: Math.min(Math.max(l, band.minL), band.maxL),
  };
}

function triplet({ h, s, l }: Hsl): string {
  return `${round(h)} ${round(s)}% ${round(l)}%`;
}

const NEAR_WHITE: Hsl = { h: 210, s: 40, l: 98 };
const NEAR_BLACK: Hsl = { h: 222.2, s: 47.4, l: 11.2 };

/**
 * Elige entre texto casi-blanco y casi-negro el que tenga más contraste real
 * (WCAG) sobre el color dado. Comparar luminancia relativa y no la luminosidad
 * HSL importa: un amarillo y un azul con el mismo `l` contrastan distinto.
 */
function foregroundFor(background: Hsl): string {
  const bg = relativeLuminance(background);
  const onWhite = contrastRatio(bg, relativeLuminance(NEAR_WHITE));
  const onBlack = contrastRatio(bg, relativeLuminance(NEAR_BLACK));
  return onBlack > onWhite ? triplet(NEAR_BLACK) : triplet(NEAR_WHITE);
}

function contrastRatio(a: number, b: number): number {
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Luminancia relativa WCAG 2.x (con corrección de gamma sRGB). */
function relativeLuminance(hsl: Hsl): number {
  const { r, g, b } = hslToRgb(hsl);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Deshace la corrección de gamma sRGB de un canal 0–255. */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hslToRgb({ h, s, l }: Hsl): { r: number; g: number; b: number } {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = ln - c / 2;

  let rgb: [number, number, number];
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  };
}

function hexToHsl(hex?: string | null): Hsl | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const rn = rgb.r / 255;
  const gn = rgb.g / 255;
  const bn = rgb.b / 255;
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

  return { h, s: s * 100, l: l * 100 };
}

/** Normaliza `#abc` / `abc123` a `#aabbcc`. Asume hex ya validado. */
function normalizeHex(hex: string): string {
  let value = hex.trim().replace(/^#/, '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return `#${value.toLowerCase()}`;
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
