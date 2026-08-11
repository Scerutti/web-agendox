import * as React from 'react';

import { THEME_STORAGE_KEY } from './theme-provider';

/* Corre antes del primer pintado y aplica la clase `.dark` leyendo localStorage
   (o `prefers-color-scheme` si no hay preferencia guardada). Sin esto, el HTML
   del servidor sale siempre en claro y el usuario que eligió oscuro ve un
   flash blanco en cada navegación. Va en el `<head>`, síncrono a propósito:
   es un script de 10 líneas y tiene que bloquear el pintado. */
const SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

/**
 * Script anti-flash de tema. Montar en el `<head>` del root layout, antes de
 * cualquier contenido. Es un Server Component: no manda JS al bundle del
 * cliente más allá del propio inline.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
