import { NextResponse } from 'next/server';
import { clearCustomerCookie } from '@/lib/customer/cookies';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const res = NextResponse.json({ ok: true });
  clearCustomerCookie(res, slug);
  return res;
}
