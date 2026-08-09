import type { NextResponse } from 'next/server';

// El customer token está scopeado por slug: cada negocio tiene su cookie.
export function custCookieName(slug: string): string {
  return `agx_cust_${slug}`;
}

const isProd = process.env.NODE_ENV === 'production';
const base = {
  httpOnly: true as const,
  sameSite: 'lax' as const,
  secure: isProd,
  path: '/',
};

export function setCustomerCookie(
  res: NextResponse,
  slug: string,
  token: string,
): void {
  res.cookies.set(custCookieName(slug), token, {
    ...base,
    maxAge: 60 * 60 * 24, // 1 día (la validez real la fija el exp del token)
  });
}

export function clearCustomerCookie(res: NextResponse, slug: string): void {
  res.cookies.set(custCookieName(slug), '', { ...base, maxAge: 0 });
}
