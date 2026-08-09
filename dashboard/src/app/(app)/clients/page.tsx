import { getClients } from '@/lib/api/clients';
import { NoAccess } from '@/components/no-access';
import { ClientsManager } from './clients-manager';

const PAGE_SIZE = 20;

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = '', page = '1' } = await searchParams;
  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
  const result = await getClients({
    q,
    limit: PAGE_SIZE,
    offset: (pageNum - 1) * PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Alta y edición de clientes del negocio.
        </p>
      </div>
      {result ? (
        <ClientsManager
          clients={result.items}
          total={result.total}
          q={q}
          pageNum={pageNum}
          pageSize={PAGE_SIZE}
        />
      ) : (
        <NoAccess resource="los clientes" />
      )}
    </div>
  );
}
