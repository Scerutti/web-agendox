import { proxyCustomer } from '@/lib/api/proxy';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = await req.text();
  return proxyCustomer(slug, '/portal/push/subscriptions', {
    method: 'POST',
    body,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = await req.text();
  return proxyCustomer(slug, '/portal/push/subscriptions', {
    method: 'DELETE',
    body,
  });
}
