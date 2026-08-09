import { proxyCustomer } from '@/lib/api/proxy';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return proxyCustomer(slug, '/portal/notifications/unread-count');
}
