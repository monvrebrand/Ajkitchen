import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Only run Supabase auth check on account/auth routes — not on every page
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return await updateSession(request)
  }
}

export const config = {
  matcher: [
    // Only match routes that need auth checking
    '/account/:path*',
    '/auth/:path*',
  ],
}
