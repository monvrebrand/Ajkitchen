import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&countrycodes=us`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AJKitchen/1.0 (ajkitchen.com)',
        'Accept-Language': 'en',
      },
      next: { revalidate: 60 }, // cache for 60s
    });

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Address proxy error:', err);
    return NextResponse.json([]);
  }
}
