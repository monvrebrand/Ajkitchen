// src/middleware.ts — JWT-based auth middleware
import { type NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

const ADMIN_COOKIE = 'ajk_admin_session';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  /* ── Admin protection ─────────────────────────────────────── */
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
    let adminOk = false;

    if (adminToken && process.env.JWT_SECRET) {
      try {
        await jwtVerify(adminToken, new TextEncoder().encode(process.env.JWT_SECRET));
        adminOk = true;
      } catch {
        adminOk = false;
      }
    }

    if (!adminOk) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  /* ── Customer account/auth protection ────────────────────── */
  const isAccount = pathname.startsWith('/account');
  const isAuth    = pathname.startsWith('/auth');

  if (!isAccount && !isAuth) return NextResponse.next();

  const token    = request.cookies.get(COOKIE_NAME)?.value;
  const payload  = token ? await verifyToken(token) : null;
  const loggedIn = !!payload;

  if (!loggedIn && isAccount) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  if (loggedIn && isAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/account';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/auth/:path*'],
};
