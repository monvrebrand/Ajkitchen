import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { verifyToken, signToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth';

// PATCH /api/auth/profile — update name / address
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { fullName, address } = body;

    await sql`
      UPDATE users SET
        full_name = COALESCE(${fullName ?? null}, full_name),
        address   = COALESCE(${address  ?? null}, address)
      WHERE id = ${payload.userId}
    `;

    // Re-issue the token with updated name
    const newToken = await signToken({
      userId:   payload.userId,
      email:    payload.email,
      fullName: fullName || payload.fullName,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/auth/profile — change password
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();

    const [user] = await sql`SELECT password_hash FROM users WHERE id = ${payload.userId}`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${payload.userId}`;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
