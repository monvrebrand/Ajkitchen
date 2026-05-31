import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('screenshot') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WEBP or GIF allowed' }, { status: 400 });
    }

    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) {
      return NextResponse.json({ error: `File too large (max ${maxMB}MB)` }, { status: 400 });
    }

    const ext      = file.name.split('.').pop() || 'jpg';
    const filename = `payment-${Date.now()}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    /* ── Use Vercel Blob in production, local disk in development ── */
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`payment-screenshots/${filename}`, buffer, {
        access: 'public',
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url });
    }

    /* Local fallback (development only) */
    const dir = path.join(process.cwd(), 'public', 'payment-screenshots');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return NextResponse.json({ url: `/payment-screenshots/${filename}` });

  } catch (err) {
    console.error('[upload-screenshot]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
