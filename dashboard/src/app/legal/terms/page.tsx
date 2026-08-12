import type { Metadata } from 'next';
import { LegalDocumentPage } from '@agendox/legal';

export const metadata: Metadata = { title: 'Términos y Condiciones · Agendox' };

export default function TermsPage() {
  return <LegalDocumentPage doc="terms" />;
}
