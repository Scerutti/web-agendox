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
    // Un día, **igual** que `JWT_CUSTOMER_TTL` en el backend. Que no coincidan
    // es lo que producía el peor estado posible: la cookie viva hacía creer que
    // había sesión y la API rechazaba todo con 401. Si allá se cambia, acá
    // también.
    maxAge: 60 * 60 * 24,
  });
}

export function clearCustomerCookie(res: NextResponse, slug: string): void {
  res.cookies.set(custCookieName(slug), '', { ...base, maxAge: 0 });
}
