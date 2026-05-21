"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";

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

export default function StoreClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Silent background refresh every 30s — no loading state shown
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setProducts(data);
        }
      } catch { /* silent fail */ }
    };

    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, []);

  const tops = products.filter((p) => p.category === "Tops");

  return (
    <div className="min-h-screen bg-[#050505] pt-20 md:pt-28">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 md:mb-16"
        >
          <p className="text-[9px] tracking-[0.35em] uppercase text-white/30 mb-3">
            {tops.length > 0 ? `${tops.length} Pieces Series 01` : ""}
          </p>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white/90 uppercase">
            The Store
          </h1>
        </motion.div>

        {tops.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/30 text-sm tracking-widest uppercase">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
            {tops.map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
