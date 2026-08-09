import { proxyStaff } from '@/lib/api/proxy';

export async function POST(req: Request) {
  const body = await req.text();
  return proxyStaff('/push/subscriptions', { method: 'POST', body });
}

export async function DELETE(req: Request) {
  const body = await req.text();
  return proxyStaff('/push/subscriptions', { method: 'DELETE', body });
}
