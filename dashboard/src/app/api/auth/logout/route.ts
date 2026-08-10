import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiUrl } from '@/lib/env';
import { RT, clearAuthCookies } from '@/lib/auth/cookies';

export async function POST() {
  const store = await cookies();
  const refreshToken = store.get(RT)?.value;

  if (refreshToken) {
    try {
      await fetch(apiUrl('/auth/logout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // best-effort: aunque falle en el backend, limpiamos la sesión local.
    }
  }

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
