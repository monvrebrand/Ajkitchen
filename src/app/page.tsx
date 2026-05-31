// Server Component — no "use client"
import { Suspense } from "react";
import { sql } from "@/lib/db";
import HeroDeconstruction from "@/components/HeroDeconstruction";
import ProductCard from "@/components/ProductCard";
import NewsletterSection from "@/components/NewsletterSection";
import Link from "next/link";
import Image from "next/image";

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

const FOOD_CATEGORIES = ["Main Meals", "Sides", "Drinks"];

async function FeaturedProducts() {
  try {
    const FOOD_CATEGORIES = ["Main Meals", "Sides", "Drinks"];
    const data = await sql`
      SELECT * FROM products
      WHERE category = ANY(${FOOD_CATEGORIES})
      ORDER BY created_at DESC
    `;

    if (!data || data.length === 0) return <NoMealsFound />;

    const foodItems   = data as Product[];
    const featured    = foodItems.filter((p) => p.featured);
    const nonFeatured = foodItems.filter((p) => !p.featured);
    const results     = [...featured, ...nonFeatured].slice(0, 4);

    if (results.length === 0) return <NoMealsFound />;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {results.map((p, i) => (
          <ProductCard key={p.id} product={p as any} index={i} />
        ))}
      </div>
    );
  } catch {
    return <NoMealsFound />;
  }
}

function NoMealsFound() {
  return (
    <div className="text-center py-12 border border-pink-100 bg-pink-50/10 rounded-sm">
      <p className="text-pink-300 text-xs tracking-widest uppercase font-bold">Menu is updating. Check back soon!</p>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-square bg-pink-50 animate-pulse rounded-sm" />
          <div className="h-3 w-3/4 bg-pink-50 animate-pulse rounded-sm" />
          <div className="h-3 w-1/4 bg-pink-50 animate-pulse rounded-sm" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ===== Immersive Hero ===== */}
      <HeroDeconstruction />

      {/* ===== Brand Marquee ===== */}
      <div className="overflow-hidden border-y border-pink-100 py-4 bg-white relative z-10">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-[9px] tracking-[0.45em] uppercase text-pink-500 font-black mx-8">
              Jollof Rice • Fried Rice • Waakye • Kelewele • Red Red • &nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ===== Featured Meals ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-32 pb-16 md:pb-24 bg-white">
        <div className="flex items-end justify-between mb-8 md:mb-16">
          <div>
            <p className="text-[8px] tracking-[0.35em] uppercase text-pink-400 mb-2 font-black">Our Menu</p>
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-pink-600 uppercase">
              Featured Meals
            </h2>
          </div>
          <Link
            href="/store"
            className="text-[10px] tracking-[0.2em] uppercase text-pink-500 border-b-2 border-pink-500 pb-1 transition-all hover:text-pink-700 hover:border-pink-700 font-black"
          >
            View Full Menu
          </Link>
        </div>

        <Suspense fallback={<ProductSkeleton />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* ===== Brand Story ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 border-t border-pink-100 bg-white">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <p className="text-[8px] tracking-[0.35em] uppercase text-pink-400 mb-4 md:mb-6 font-black">About AJ KITCHEN</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-pink-600 uppercase leading-tight mb-5 md:mb-8">
              Authentic<br />Ghanaian Taste<br />in Columbus
            </h2>
            <p className="text-sm text-pink-800/80 leading-relaxed max-w-md mb-7 md:mb-10 font-medium">
              AJ KITCHEN brings the heart of West Africa to Ohio. We specialize in homemade meals like Jollof rice, Waakye, and Kelewele, prepared with traditional spices and massive crispy fried chicken.
              <br /><br />
              <strong className="text-pink-600 font-black uppercase tracking-tight">Order Schedule:</strong><br />
              We take pre-orders during the week and deliver fresh every Saturday and Sunday across Columbus.
            </p>
            <Link
              href="/store"
              className="inline-block border-2 border-pink-500 text-[10px] tracking-[0.25em] uppercase px-8 py-4 text-pink-600 font-black hover:bg-pink-500 hover:text-white transition-all rounded-sm"
            >
              Order for this Weekend
            </Link>
          </div>
          <div className="relative aspect-[4/5] bg-pink-50 rounded-sm overflow-hidden shadow-inner border border-pink-100">
             <Image
              src="/hero-dark.jpg"
              alt="Authentic Ghanaian Food"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ===== Newsletter ===== */}
      <NewsletterSection />
    </>
  );
}
