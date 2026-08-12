import { NextResponse, type NextRequest } from 'next/server';
import { AT, clearAdminCookie } from '@/lib/auth/cookies';
import { isExpired } from '@/lib/auth/jwt';

const PUBLIC_PATHS = ['/login'];

/**
 * Rutas que se leen igual con sesión y sin sesión. No van en `PUBLIC_PATHS`
 * porque esas, estando logueado, redirigen a la home: el link del footer tiene
 * que abrir el documento, no sacar al operador de ahí.
 */
const OPEN_PATHS = ['/legal'];

function matches(paths: string[], pathname: string): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublic(pathname: string): boolean {
  return matches(PUBLIC_PATHS, pathname);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AT)?.value;
  const authed = !!token && !isExpired(token);
  const pub = isPublic(pathname);

  if (matches(OPEN_PATHS, pathname)) return NextResponse.next();

  if (!authed && !pub) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    const res = NextResponse.redirect(url);
    clearAdminCookie(res);
    return res;
  }

  if (authed && pub) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Corre en todo salvo API routes, estáticos y archivos con extensión.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
