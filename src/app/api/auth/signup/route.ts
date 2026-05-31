import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { signToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth';

// POST /api/auth/signup
export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await req.json();

    if (!email || !password || !phone) {
      return NextResponse.json({ error: 'Email, password, and phone number are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check for existing user
    const [existing] = await sql`SELECT id FROM users WHERE LOWER(email) = ${email.toLowerCase()}`;
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();

    const [user] = await sql`
      INSERT INTO users (email, password_hash, full_name, first_name, last_name, phone)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName}, ${firstName || ''}, ${lastName || ''}, ${phone || ''})
      RETURNING id, email, full_name
    `;

    // Auto sign-in after signup
    const token = await signToken({ userId: user.id, email: user.email, fullName: user.full_name });

    const res = NextResponse.json({ success: true, userId: user.id });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return res;
  } catch (err: any) {
    console.error('[/api/auth/signup]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
