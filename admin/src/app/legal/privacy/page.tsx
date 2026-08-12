import type { Metadata } from 'next';
import { LegalDocumentPage } from '@agendox/legal';

export const metadata: Metadata = { title: 'Política de Privacidad · Agendox' };

export default function PrivacyPage() {
  return <LegalDocumentPage doc="privacy" />;
}
