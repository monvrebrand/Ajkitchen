import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

/* PATCH /api/auth/update-address — save delivery address to user profile */
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { address, city, state, zip } = await req.json();

    await sql`
      UPDATE users
      SET
        address = ${address || ''},
        city    = ${city    || ''},
        state   = ${state   || ''},
        zip     = ${zip     || ''}
      WHERE id = ${payload.userId}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[update-address]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
