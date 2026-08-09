import type { NextResponse } from 'next/server';

// Nombres de cookie de sesión staff (httpOnly). El customer token (agx_cust)
// es de la app booking (FM4), no de acá.
export const AT = 'agx_at';
export const RT = 'agx_rt';

const isProd = process.env.NODE_ENV === 'production';

const base = {
  httpOnly: true as const,
  sameSite: 'lax' as const,
  secure: isProd,
  path: '/',
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function setAuthCookies(res: NextResponse, tokens: AuthTokens): void {
  res.cookies.set(AT, tokens.accessToken, { ...base, maxAge: 60 * 60 }); // 1h
  res.cookies.set(RT, tokens.refreshToken, {
    ...base,
    maxAge: 60 * 60 * 24 * 30, // 30d
  });
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(AT, '', { ...base, maxAge: 0 });
  res.cookies.set(RT, '', { ...base, maxAge: 0 });
}
