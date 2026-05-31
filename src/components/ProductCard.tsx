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

  const brandPink = "text-[#db2777]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.08, 0.32) }}
      className="relative z-10"
    >
      <Link href={`/product/${product.id}`} className="group block">
        {/* Image container */}
        <div className="relative aspect-square bg-pink-50 overflow-hidden mb-2.5 md:mb-4 rounded-sm border border-pink-100 shadow-sm">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100 p-2"
          />

          {product.tag && (
            <span className="absolute top-2 left-2 md:top-4 md:left-4 text-[8px] tracking-[0.15em] uppercase bg-[#db2777] text-white px-1.5 py-0.5 md:px-2 md:py-1 font-black z-10 rounded-sm shadow-md">
              {product.tag}
            </span>
          )}

          <button
            onClick={handleQuickAdd}
            className="
              absolute bottom-0 left-0 right-0
              text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase
              py-3 transition-all duration-200 z-10
              bg-[#db2777] text-white hover:bg-[#be185d] active:bg-[#9d174d]
              opacity-100 translate-y-0
              md:opacity-0 md:translate-y-full
              md:group-hover:opacity-100 md:group-hover:translate-y-0
            "
            aria-label={`Order ${product.name}`}
          >
            See Meal Details →
          </button>
        </div>

        {/* Info row */}
        <div className="flex items-start justify-between gap-1.5 px-0.5">
          <div className="min-w-0">
            <p className={`text-xs md:text-sm font-black ${brandPink} group-hover:opacity-80 transition-opacity leading-tight truncate uppercase tracking-tight`}>
              {product.name}
            </p>
            <p className="text-[10px] text-pink-300 mt-0.5 tracking-widest uppercase font-black hidden md:block">
              {product.category}
            </p>
          </div>
          <p className={`text-xs md:text-sm ${brandPink} font-black flex-shrink-0`}>$ {product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
}
