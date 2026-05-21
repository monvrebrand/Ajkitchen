"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();

  const handleQuickAdd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.08, 0.32) }}
    >
      <Link href={`/product/${product.id}`} className="group block">
        {/* Image container */}
        <div className="relative aspect-square bg-[#0d0d0d] overflow-hidden mb-2.5 md:mb-4">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {product.tag && (
            <span className="absolute top-2 left-2 md:top-4 md:left-4 text-[8px] tracking-[0.15em] uppercase bg-white text-black px-1.5 py-0.5 md:px-2 md:py-1 font-bold z-10">
              {product.tag}
            </span>
          )}

          {/*
            Select Size button:
            - Mobile  : always visible at the bottom
            - Desktop : hidden by default, slides up on group-hover
          */}
          <button
            onClick={handleQuickAdd}
            className="
              absolute bottom-0 left-0 right-0
              text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase
              py-3 transition-all duration-200 z-10
              bg-white text-black hover:bg-white/90 active:bg-white/80
              opacity-100 translate-y-0
              md:opacity-0 md:translate-y-full
              md:group-hover:opacity-100 md:group-hover:translate-y-0
            "
            aria-label={`Select size for ${product.name}`}
          >
            Select Size →
          </button>
        </div>

        {/* Info row */}
        <div className="flex items-start justify-between gap-1.5 px-0.5">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-semibold text-white/90 group-hover:text-white transition-colors leading-tight truncate">
              {product.name}
            </p>
            <p className="text-[10px] text-white/35 mt-0.5 tracking-widest uppercase hidden md:block">
              {product.category}
            </p>
          </div>
          <p className="text-xs md:text-sm text-white/65 flex-shrink-0">GHS {product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
}
