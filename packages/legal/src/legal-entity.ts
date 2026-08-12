/**
 * Datos del prestador del servicio, usados por los dos documentos legales.
 *
 * Ningún valor puede quedar vacío ni entre corchetes: mientras alguno lo esté,
 * las páginas legales muestran arriba del documento un aviso que dice cuál falta
 * (ver {@link pendingLegalFields}), para que no se publique un contrato con
 * huecos sin que nadie lo note.
 */
export const LEGAL_ENTITY = {
  /** Nombre comercial con el que se conoce el servicio. */
  brand: 'Agendox',
  /** Razón social o nombre completo de la persona humana titular. */
  legalName: 'Sebastián Gustavo Cerutti',
  /** CUIT o CUIL del titular. */
  taxId: '20-39256763-2',
  /**
   * Domicilio legal, donde se reciben notificaciones formales. Va **completo**
   * (calle, número, ciudad, provincia y CP): los documentos lo imprimen tal
   * cual, seguido del país, y no lo completan con `jurisdiction` — son datos
   * distintos y pueden no coincidir.
   */
  address: 'San Martín 697',
  /** Ciudad y provincia cuyos tribunales resultan competentes. */
  jurisdiction: 'Concepción del Uruguay, Entre Ríos',
  country: 'República Argentina',
  /** Casilla para consultas contractuales y comerciales. */
  contactEmail: 'softsys95@gmail.com',
  /** Casilla para ejercer derechos sobre datos personales. */
  privacyEmail: 'softsys95@gmail.com',
} as const;

type LegalField = keyof typeof LEGAL_ENTITY;

/** Nombre en castellano de cada dato, para poder decir en el aviso qué falta. */
const FIELD_LABELS: Record<LegalField, string> = {
  brand: 'nombre comercial',
  legalName: 'razón social',
  taxId: 'CUIT/CUIL',
  address: 'domicilio legal',
  jurisdiction: 'jurisdicción',
  country: 'país',
  contactEmail: 'email de contacto',
  privacyEmail: 'email de privacidad',
};

/**
 * Un dato falta si conserva los corchetes del marcador **o si quedó vacío**. Lo
 * segundo importa: borrar el marcador sin poner el valor apagaba el aviso y
 * dejaba el documento con un hueco silencioso ("con domicilio en , República
 * Argentina"), que es exactamente lo que este chequeo tiene que evitar.
 */
function isPending(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === '' || (trimmed.startsWith('[') && trimmed.endsWith(']'));
}

/** Datos del prestador que faltan completar, con su nombre para mostrar. */
export function pendingLegalFields(): string[] {
  return (Object.entries(LEGAL_ENTITY) as [LegalField, string][])
    .filter(([, value]) => isPending(value))
    .map(([field]) => FIELD_LABELS[field]);
}

/**
 * `true` mientras queden datos del prestador sin completar. Las páginas legales
 * lo usan para mostrar el aviso; es preferible una advertencia visible a un
 * documento que dice "[CUIT / CUIL]" en producción.
 */
export function hasPendingLegalData(): boolean {
  return pendingLegalFields().length > 0;
}
