import { pendingLegalFields } from './legal-entity';
import { PrivacyDocument } from './privacy';
import { TermsDocument } from './terms';

/**
 * Aviso de que el documento todavía tiene datos del prestador sin completar.
 *
 * Se muestra en producción a propósito: un cartel que avisa del hueco es menos
 * grave que un contrato que dice "[CUIT / CUIL]" y que nadie mira. Desaparece
 * solo, cuando se completan los valores de `legal-entity.ts`.
 */
function PendingLegalDataNotice({ missing }: { missing: string[] }) {
  return (
    <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
      <p className="font-medium">Documento pendiente de completar</p>
      <p>
        Falta{missing.length > 1 ? 'n' : ''} {missing.join(', ')} en{' '}
        <code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">
          frontend/packages/legal/src/legal-entity.ts
        </code>
        .
      </p>
    </div>
  );
}

/**
 * Página de un documento legal, compartida por las tres apps para que el texto
 * viva en un solo lugar y las rutas sean idénticas (`/legal/terms` y
 * `/legal/privacy`): así el footer común puede linkear con rutas relativas.
 */
export function LegalDocumentPage({ doc }: { doc: 'terms' | 'privacy' }) {
  const missing = pendingLegalFields();
  return (
    <div className="mx-auto max-w-3xl space-y-5 py-2">
      {missing.length > 0 ? <PendingLegalDataNotice missing={missing} /> : null}
      {doc === 'terms' ? <TermsDocument /> : <PrivacyDocument />}
    </div>
  );
}
