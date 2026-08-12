/**
 * Versión del documento de Términos y Condiciones que se muestra en el panel.
 *
 * **Tiene que coincidir con `CURRENT_TERMS_VERSION` del backend**
 * (`backend/api-agendox/src/modules/legal/domain/terms.ts`), que es quien decide
 * si hace falta aceptar y qué versión queda registrada. Al cambiar el texto de
 * forma sustantiva: se bumpean las dos en el mismo commit y todas las
 * organizaciones vuelven a ver el gate de aceptación.
 *
 * Una corrección de tipeo o de redacción que no altera obligaciones **no** lleva
 * bump: reabrir el gate para todos tiene un costo y conviene reservarlo para
 * cuando el cambio importa.
 */
export const TERMS_VERSION = '2026-08-12';

/**
 * Versión de la Política de Privacidad. Se muestra en el documento para que se
 * pueda citar, pero no se acepta ni se registra: informar no requiere
 * consentimiento, y los datos que trata la plataforma se tratan porque son
 * necesarios para prestar el servicio, no porque alguien apretó un botón.
 */
export const PRIVACY_VERSION = '2026-08-12';
