import { NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/auth/cookies';

// El token de super admin no tiene refresh ni revocación server-side (TTL corto):
// el logout simplemente limpia la cookie local.
export function POST() {
  const res = NextResponse.json({ ok: true });
  clearAdminCookie(res);
  return res;
}
