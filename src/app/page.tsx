// Server Component — no "use client"
// Products are fetched from Supabase at request time — no loading flash.

import { createClient } from "@/utils/supabase/server";
import MonvreDeconstruction from "@/components/MonvreDeconstruction";
import ProductCard from "@/components/ProductCard";
import NewsletterSection from "@/components/NewsletterSection";
import Link from "next/link";

export const revalidate = 30; // ISR — revalidate every 30s

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  in_stock: boolean;
  sizes?: string[];
  tag?: string;
  featured?: boolean;
}

async function getFeatured(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!data || data.length === 0) return [];
    const featured    = data.filter((p: Product) => p.featured);
    const nonFeatured = data.filter((p: Product) => !p.featured);
    // Fill up to 4: featured first, then non-featured to pad
    const result = [...featured, ...nonFeatured].slice(0, 4);
    return result as Product[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      {/* ===== Scrollytelling Hero ===== */}
      <MonvreDeconstruction />

      {/* ===== Brand Marquee ===== */}
      <div className="overflow-hidden border-y border-white/5 py-4 bg-[#050505]">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-[9px] tracking-[0.45em] uppercase text-white mx-8">
              MONVRE Series 01 Tech Garment Limited Drop 340gsm Cotton &nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ===== Featured Products ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-32 pb-16 md:pb-24">
        <div className="flex items-end justify-between mb-8 md:mb-16">
          <div>
            <p className="text-[8px] tracking-[0.35em] uppercase text-white/30 mb-2">Series 01</p>
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-white/90 uppercase">
              Featured
            </h2>
          </div>
          <Link
            href="/store"
            className="text-[10px] tracking-[0.2em] uppercase text-white border-b border-white pb-0.5 transition-all"
          >
            View All
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-12 border border-white/5 bg-white/[0.01]">
            <p className="text-white/30 text-xs tracking-widest uppercase">No featured products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ===== Brand Story ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <p className="text-[8px] tracking-[0.35em] uppercase text-white/30 mb-4 md:mb-6">About</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white/90 uppercase leading-tight mb-5 md:mb-8">
              Built for the<br />Void Between<br />Fashion &amp; Function
            </h2>
            <p className="text-sm text-white/50 leading-relaxed max-w-md mb-7 md:mb-10">
              MONVRE was born from the intersection of technical fabrication and streetwear identity.
              Every piece in Series 01 is engineered to perform at the intersection of art and utility.
            </p>
            <Link
              href="/store"
              className="inline-block border border-white/20 text-[10px] tracking-[0.25em] uppercase px-7 py-3.5 hover:bg-white hover:text-black transition-all"
            >
              Explore Series 01
            </Link>
          </div>
          <div className="relative aspect-[4/5] bg-neutral-900 border border-white/5 overflow-hidden">
            <img
              src="/hero-dark.jpg"
              alt="MONVRE Technical Aesthetic"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </div>
      </section>

      {/* ===== Newsletter ===== */}
      <NewsletterSection />
    </>
  );
}
