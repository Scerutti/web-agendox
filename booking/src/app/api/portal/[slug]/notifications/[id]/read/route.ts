import { proxyCustomer } from '@/lib/api/proxy';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  return proxyCustomer(slug, `/portal/notifications/${id}/read`, {
    method: 'POST',
  });
}
