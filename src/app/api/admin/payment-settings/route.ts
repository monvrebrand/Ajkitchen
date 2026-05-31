import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';

const ADMIN_COOKIE = 'ajk_admin_session';

async function isAdmin(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(ADMIN_COOKIE)?.value;
    if (!token || !process.env.JWT_SECRET) return false;
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return true;
  } catch { return false; }
}

/* GET — fetch all payment settings as a flat object */
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const rows = await sql`SELECT key, value FROM payment_settings`;
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.key as string] = row.value as string;
    return NextResponse.json(settings);
  } catch (err) {
    console.error('[payment-settings GET]', err);
    return NextResponse.json({}, { status: 500 });
  }
}

/* POST — upsert one or more keys */
export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json() as Record<string, string>;
    for (const [key, value] of Object.entries(body)) {
      await sql`
        INSERT INTO payment_settings (key, value)
        VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[payment-settings POST]', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
