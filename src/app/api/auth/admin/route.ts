import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const ADMIN_COOKIE = 'ajk_admin_session';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const correct = process.env.ADMIN_PASSWORD;
    const secret  = process.env.JWT_SECRET;

    if (!correct || !secret) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
    }

    if (password !== correct) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    /* Issue a signed admin JWT (24 h) */
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(secret));

    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 60 * 24, // 24 hours
    });
    return res;

  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* DELETE — logout */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
