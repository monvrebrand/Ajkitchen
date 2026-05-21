"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { getProductById } from "@/lib/products";
import { useCart } from "@/context/CartContext";

interface DbProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  details?: string[];
  sizes?: string[];
  tag?: string;
  in_stock?: boolean;
  quantity?: number;
  featured?: boolean;
}

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addItem } = useCart();

  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Try fetching from API (Supabase) first
    fetch(`/api/products`)
      .then((r) => r.json())
      .then((data: DbProduct[]) => {
        if (Array.isArray(data)) {
          const found = data.find((p) => p.id === id);
          if (found) {
            setProduct(found);
            setLoading(false);
            return;
          }
        }
        // Fallback: check static products
        const staticProduct = getProductById(id);
        if (staticProduct) {
          setProduct(staticProduct as unknown as DbProduct);
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback: static products
        const staticProduct = getProductById(id);
        if (staticProduct) setProduct(staticProduct as unknown as DbProduct);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-16 md:pt-20 flex items-center justify-center">
        <p className="text-white/20 text-xs tracking-widest uppercase animate-pulse">Loading…</p>
      </div>
    );
  }

  if (!product) return notFound();

  const sizes = (product.sizes && product.sizes.length > 0) ? product.sizes : DEFAULT_SIZES;

  return (
    <div className="min-h-screen bg-[#050505] pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-white/30 mb-8 md:mb-12">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/store" className="hover:text-white transition-colors">Store</Link>
          <span>/</span>
          <span className="text-white/50 truncate max-w-[120px]">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-[#0d0d0d]"
            style={{ aspectRatio: "4/5" }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
            {product.tag && (
              <span className="absolute top-4 left-4 text-[9px] tracking-[0.2em] uppercase bg-white text-black px-2 py-1 font-bold">
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
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white/90 uppercase mb-4">
              {product.name}
            </h1>
            <p className="text-2xl text-white/80 font-light mb-8">GHS {product.price}</p>

            {product.description && (
              <p className="text-sm text-white/50 leading-relaxed mb-10 border-t border-white/5 pt-8">
                {product.description}
              </p>
            )}

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] tracking-[0.25em] uppercase text-white/40">Select Size</p>
                {error && (
                  <p className="text-[9px] tracking-widest uppercase text-red-400">Please select a size</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[56px] py-3 px-4 text-xs tracking-widest uppercase border transition-all touch-manipulation ${
                      selectedSize === size
                        ? "border-white bg-white text-black"
                        : "border-white/15 text-white/60 hover:border-white/50 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart — sticky on mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#050505]/95 backdrop-blur md:static md:p-0 md:bg-transparent md:backdrop-blur-none z-50">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 md:py-4 text-xs font-bold tracking-[0.25em] uppercase transition-all touch-manipulation ${
                  added
                    ? "bg-green-500 text-white"
                    : selectedSize
                      ? "bg-white text-black hover:bg-white/90 active:bg-white/80"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                {added
                  ? "Added to Cart ✓"
                  : selectedSize
                    ? `Add to Cart — GHS ${product.price}`
                    : "Select a Size First"}
              </button>
            </div>

            {/* Details List */}
            {product.details && product.details.length > 0 && (
              <div className="mt-8 md:mt-12 mb-24 md:mb-0 border-t border-white/5 pt-8">
                <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-5">Details</p>
                <ul className="space-y-3">
                  {product.details.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-xs text-white/50">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-white/30 flex-shrink-0" />
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
