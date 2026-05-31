import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const data = await sql`SELECT * FROM products ORDER BY name`;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, category, image, in_stock, sizes, tag, featured } = body;
    const [row] = await sql`
      INSERT INTO products (name, price, category, image, in_stock, sizes, tag, featured)
      VALUES (${name}, ${price}, ${category}, ${image}, ${in_stock ?? true},
              ${JSON.stringify(sizes ?? [])}, ${tag ?? null}, ${featured ?? false})
      RETURNING *
    `;
    return NextResponse.json(row);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, name, price, category, image, in_stock, sizes, tag, featured } = await req.json();
    await sql`
      UPDATE products SET
        name      = COALESCE(${name      ?? null}, name),
        price     = COALESCE(${price     ?? null}, price),
        category  = COALESCE(${category  ?? null}, category),
        image     = COALESCE(${image     ?? null}, image),
        in_stock  = COALESCE(${in_stock  ?? null}, in_stock),
        sizes     = COALESCE(${sizes ? JSON.stringify(sizes) : null}::jsonb, sizes),
        tag       = COALESCE(${tag       ?? null}, tag),
        featured  = COALESCE(${featured  ?? null}, featured)
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await sql`DELETE FROM products WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
