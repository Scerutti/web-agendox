'use client';

import * as React from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/** Clave de localStorage. Compartida por las tres apps (dominios distintos). */
export const THEME_STORAGE_KEY = 'agx_theme';

interface ThemeContextValue {
  /** Lo que eligió el usuario, incluido `system`. */
  preference: ThemePreference;
  /** El tema que efectivamente se está pintando. */
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /** Alterna claro/oscuro tomando el resuelto como punto de partida. */
  toggle: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/**
 * Provider de tema propio, sin dependencias. Guarda la preferencia en
 * localStorage, resuelve `system` con `prefers-color-scheme` y refleja el
 * resultado en la clase `.dark` del `<html>` (que es lo que espera el preset de
 * Tailwind, `darkMode: ['class']`).
 *
 * El primer pintado ya viene correcto desde {@link ThemeScript}; este provider
 * arranca leyendo lo que ese script dejó aplicado, así no hay salto de tema ni
 * mismatch de hidratación.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = React.useState<ThemePreference>('system');
  const [systemDark, setSystemDark] = React.useState(false);

  // Sincroniza el estado de React con lo que el script inline ya decidió.
  React.useEffect(() => {
    setPreferenceState(readStoredPreference());
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(media.matches);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const resolved: ResolvedTheme =
    preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  React.useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  const setPreference = React.useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      if (next === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
      else window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage bloqueado (modo privado, cookies de terceros): el tema
      // sigue funcionando en esta pestaña, solo no se recuerda.
    }
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      preference,
      resolved,
      setPreference,
      toggle: () => setPreference(resolved === 'dark' ? 'light' : 'dark'),
    }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme necesita estar dentro de <ThemeProvider>');
  }
  return context;
}

function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  // Le avisa al navegador para que scrollbars, inputs nativos y el color picker
  // se pinten en el mismo tema que el resto.
  root.style.colorScheme = resolved;
}
