import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const data = await sql`SELECT * FROM tickets ORDER BY created_at DESC`;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, reply } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const [row] = await sql`
      UPDATE tickets
      SET
        status = COALESCE(${status ?? null}, status),
        reply  = COALESCE(${reply  ?? null}, reply)
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json(row);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
