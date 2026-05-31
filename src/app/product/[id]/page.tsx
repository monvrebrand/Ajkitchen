"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/products";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote]       = useState("");
  const [added, setAdded]     = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);

  useEffect(() => {
    fetch("/api/payment-settings")
      .then(r => r.json())
      .then(data => {
        if (data && data.store_open !== undefined) {
          setStoreOpen(data.store_open === "true");
        }
      })
      .catch(() => {});

    fetch(`/api/products`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (Array.isArray(data)) {
          const found = data.find((p) => p.id === id);
          setProduct(found ?? null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product || !storeOpen) return;
    addItem({
      id:    product.id,
      name:  product.name,
      price: product.price,
      image: product.image,
      size:  "Regular",
      note:  note.trim() || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const brandPink = "text-[#db2777]";

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16 md:pt-20 flex items-center justify-center">
        <p className="text-pink-300 text-xs tracking-widest uppercase animate-pulse font-black">Loading Menu…</p>
      </div>
    );
  }

  if (!product) return notFound();

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-pink-300 mb-6 font-black">
          <Link href="/" className="hover:text-[#db2777] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/store" className="hover:text-[#db2777] transition-colors">Menu</Link>
          <span>/</span>
          <span className="text-pink-500 truncate max-w-[120px]">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-pink-50 rounded-lg overflow-hidden border border-pink-100 shadow-sm"
            style={{ aspectRatio: "1/1" }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
            />
            {product.tag && (
              <span className="absolute top-4 left-4 text-[9px] tracking-[0.2em] uppercase bg-[#db2777] text-white px-2 py-1 font-black z-10 rounded-sm shadow-md">
                {product.tag}
              </span>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-2 font-black">
              {product.category}
            </p>
            <h1 className={`text-3xl md:text-4xl font-black tracking-tighter ${brandPink} uppercase mb-4 leading-tight`}>
              {product.name}
            </h1>
            <p className={`text-2xl ${brandPink} font-black mb-8`}>$ {product.price}</p>

            {product.description && (
              <p className="text-sm text-pink-700/70 font-bold leading-relaxed mb-8 border-t border-pink-100 pt-8">
                {product.description}
              </p>
            )}

            {/* Portion — single badge, no selection needed */}
            <div className="mb-8 flex items-center gap-3">
              <p className="text-[9px] tracking-[0.25em] uppercase text-pink-400 font-black">Portion</p>
              <span className="border-2 border-[#db2777] bg-[#db2777] text-white text-xs px-4 py-2 font-black tracking-widest uppercase rounded-sm shadow-sm">
                Regular
              </span>
            </div>

            {/* ── Special Instructions ────────────────────────── */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[9px] tracking-[0.25em] uppercase text-pink-400 font-black">
                  Special Instructions
                </p>
                <span className="text-[8px] tracking-widest uppercase text-pink-200 font-bold border border-pink-100 px-1.5 py-0.5 rounded-sm">
                  Optional
                </span>
              </div>
              <textarea
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                maxLength={300}
                placeholder="e.g. No pepper, extra plantain, less salt, nut allergy…"
                className="w-full bg-pink-50/30 border border-pink-100 text-pink-700 text-xs px-4 py-3 placeholder:text-pink-200 focus:outline-none focus:border-pink-400 transition-colors font-bold rounded-sm resize-none"
              />
              <p className="text-[9px] text-pink-200 font-bold mt-1 text-right">{note.length}/300</p>
            </div>

             {/* Add to Cart */}
             <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur md:static md:p-0 md:bg-transparent md:backdrop-blur-none z-50 border-t border-pink-100 md:border-0">
               <button
                 onClick={handleAddToCart}
                 disabled={!storeOpen}
                 className={`w-full py-5 md:py-4 text-xs font-black tracking-[0.25em] uppercase transition-all touch-manipulation rounded-sm shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                   added
                     ? "bg-green-500 text-white"
                     : "bg-[#db2777] text-white hover:bg-[#be185d] active:bg-[#9d174d]"
                 }`}
               >
                 {added ? "Added to Order ✓" : storeOpen ? `Pre-order Now — $ ${product.price}` : "Kitchen is Closed 🚧"}
               </button>
             </div>

            {/* Details List */}
            {product.details && product.details.length > 0 && (
              <div className="mt-8 md:mt-12 mb-24 md:mb-0 border-t border-pink-100 pt-8">
                <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-5 font-black">What&apos;s Inside</p>
                <ul className="space-y-3">
                  {product.details.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-xs text-pink-600 font-bold">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-pink-300 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
