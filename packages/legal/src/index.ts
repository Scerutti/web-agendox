/**
 * Documentos legales de Agendox, compartidos por las tres apps.
 *
 * El texto vive acá (una sola fuente de verdad) y las tres apps exponen las
 * mismas rutas `/legal/terms` y `/legal/privacy`, así el footer común linkea
 * relativo sin saber en qué app está.
 *
 * `TERMS_VERSION` tiene que coincidir con `CURRENT_TERMS_VERSION` del backend:
 * ver el comentario en `versions.ts`.
 */
export { LEGAL_ENTITY, hasPendingLegalData, pendingLegalFields } from './legal-entity';
export { TERMS_VERSION, PRIVACY_VERSION } from './versions';
export { TermsDocument } from './terms';
export { PrivacyDocument } from './privacy';
export { LegalDocumentPage } from './legal-document-page';
