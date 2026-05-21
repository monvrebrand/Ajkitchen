import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Only run auth logic on routes that actually need it ──────
  // Public routes (store, home, product pages, etc.) pass straight through.
  const needsAuth =
    pathname.startsWith('/account') ||
    pathname.startsWith('/auth');

  // Fast path — skip Supabase entirely for all public pages
  if (!needsAuth) {
    return NextResponse.next({ request });
  }

  // ── Protected/auth routes — check session ────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in → redirect to login
  if (!user && pathname.startsWith('/account')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Already logged in → skip login/signup pages
  if (user && pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone();
    url.pathname = '/account';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
