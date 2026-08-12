import { NextResponse, type NextRequest } from 'next/server';
import {
  AT,
  RT,
  setAuthCookies,
  clearAuthCookies,
  type AuthTokens,
} from '@/lib/auth/cookies';
import { isExpired } from '@/lib/auth/jwt';
import { apiUrl } from '@/lib/env';

// Solo el login. El alta de negocios la hace el super admin desde su panel, así
// que el dashboard no tiene ninguna ruta pública de registro.
const PUBLIC_PATHS = ['/login'];

/**
 * Rutas que se leen igual con sesión y sin sesión. Se distinguen de
 * `PUBLIC_PATHS` porque esas, estando logueado, redirigen a la home: si los
 * documentos legales estuvieran ahí, el link del footer sacaría al usuario del
 * documento en vez de mostrárselo.
 */
const OPEN_PATHS = ['/legal'];

function matches(paths: string[], pathname: string): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublic(pathname: string): boolean {
  return matches(PUBLIC_PATHS, pathname);
}

function isOpen(pathname: string): boolean {
  return matches(OPEN_PATHS, pathname);
}

async function tryRefresh(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const res = await fetch(apiUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<AuthTokens>;
    if (!data.accessToken || !data.refreshToken) return null;
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const at = req.cookies.get(AT)?.value;
  const rt = req.cookies.get(RT)?.value;

  let accessToken = at;
  let refreshed: AuthTokens | null = null;

  // Refresh proactivo: si el access venció (o falta) pero hay refresh, lo
  // renovamos acá y persistimos las cookies nuevas en la respuesta. Así los
  // server components rinden casi siempre con un token válido (no pueden
  // escribir cookies durante el render).
  if ((!at || isExpired(at)) && rt) {
    refreshed = await tryRefresh(rt);
    if (refreshed) accessToken = refreshed.accessToken;
  }

  const authed = !!accessToken && !isExpired(accessToken);
  const pub = isPublic(pathname);

  if (isOpen(pathname)) {
    const res = NextResponse.next();
    if (refreshed) setAuthCookies(res, refreshed);
    return res;
  }

  if (!authed && !pub) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('from', pathname);
    const res = NextResponse.redirect(url);
    clearAuthCookies(res);
    return res;
  }

  if (authed && pub) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    const res = NextResponse.redirect(url);
    if (refreshed) setAuthCookies(res, refreshed);
    return res;
  }

  const res = NextResponse.next();
  if (refreshed) setAuthCookies(res, refreshed);
  return res;
}

// Corre en todo salvo API routes, estáticos y archivos con extensión.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
