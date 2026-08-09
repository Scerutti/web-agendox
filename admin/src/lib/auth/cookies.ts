import type { NextResponse } from 'next/server';

/** Super-admin session cookie (httpOnly). Single access token; no refresh. */
export const AT = 'agx_admin_at';

const isProd = process.env.NODE_ENV === 'production';

const base = {
  httpOnly: true as const,
  sameSite: 'lax' as const,
  secure: isProd,
  path: '/',
};

export function setAdminCookie(res: NextResponse, accessToken: string, expiresAt: string): void {
  const maxAge = Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );
  res.cookies.set(AT, accessToken, { ...base, maxAge });
}

export function clearAdminCookie(res: NextResponse): void {
  res.cookies.set(AT, '', { ...base, maxAge: 0 });
}
