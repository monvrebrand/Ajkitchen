import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

// GET /api/auth/me — returns the current user from the JWT session cookie
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ user: null });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ user: null });

    const [user] = await sql`
      SELECT id, email, full_name, first_name, last_name, phone, address, city, state, zip, created_at
      FROM users WHERE id = ${payload.userId}
    `;
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
