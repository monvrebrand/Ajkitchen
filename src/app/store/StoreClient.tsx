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

const FOOD_CATEGORIES = ["Main Meals", "Sides", "Drinks"];

export default function StoreClient({ initialProducts }: { initialProducts: Product[] }) {
  // Filter out any leftover clothing items from database
  const filterFood = (items: Product[]) => items.filter(i => FOOD_CATEGORIES.includes(i.category));

  const [products, setProducts] = useState<Product[]>(filterFood(initialProducts));
  const [storeOpen, setStoreOpen] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      fetch("/api/payment-settings")
        .then(r => r.json())
        .then(data => {
          if (data && data.store_open !== undefined) {
            setStoreOpen(data.store_open === "true");
          }
        })
        .catch(() => {});
    };
    loadSettings();

    const refresh = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
             setProducts(filterFood(data));
          }
        }
      } catch { /* silent fail */ }
    };

    const interval = setInterval(() => {
      refresh();
      loadSettings();
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const brandPink = "text-pink-600";

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-28 pb-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 md:mb-16"
        >
          <p className="text-[9px] tracking-[0.35em] uppercase text-pink-400 mb-3 font-black">
            Weekend Menu Drops
          </p>
          <h1 className={`text-4xl md:text-7xl font-black tracking-wide ${brandPink} uppercase`}>
            AJ KITCHEN&nbsp;&nbsp;Store
          </h1>
        </motion.div>

        {!storeOpen && (
          <div className="bg-red-50 border border-red-100 p-4 md:p-6 mb-8 text-center rounded-sm">
            <p className="text-red-600 text-xs md:text-sm font-black tracking-widest uppercase">
              🚧 AJ KITCHEN IS CURRENTLY CLOSED FOR NEW PRE-ORDERS 🚧
            </p>
            <p className="text-red-400 text-[10px] md:text-xs font-bold tracking-wide mt-1 uppercase">
              You can still browse our menu, but checkout is temporarily disabled. Check back soon!
            </p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-24 border-2 border-pink-100 bg-pink-50/10 rounded-sm">
            <p className="text-pink-300 text-sm tracking-widest uppercase font-black">Kitchen is quiet right now. Check back Monday!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p as any} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
