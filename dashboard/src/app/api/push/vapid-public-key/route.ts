import { proxyStaff } from '@/lib/api/proxy';

export function GET() {
  return proxyStaff('/push/vapid-public-key');
}
