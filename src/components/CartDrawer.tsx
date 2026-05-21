"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCart();
  const prevPathname = useRef(pathname);

  // Close cart automatically on route change (solves double-click bug on mobile)
  useEffect(() => {
    if (prevPathname.current !== pathname && isOpen) {
      closeCart();
    }
    prevPathname.current = pathname;
  }, [pathname, isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-[#0a0a0a] border-l border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <h2 className="text-sm tracking-[0.25em] uppercase font-semibold">
                Cart {items.length > 0 && `(${items.length})`}
              </h2>
              <button onClick={closeCart} className="text-white/50 hover:text-white transition-colors">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/20" viewBox="0 0 24 24">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <p className="text-white/30 text-sm tracking-widest uppercase">Your cart is empty</p>
                  <button
                    onClick={() => {
                      closeCart();
                      router.push("/store");
                    }}
                    className="text-xs tracking-[0.2em] uppercase text-white border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all touch-manipulation"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="relative w-20 h-20 bg-[#111] flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">Size: {item.size}</p>
                      <p className="text-sm text-white/70 mt-1">GHS {item.price}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          className="w-6 h-6 border border-white/20 text-white/60 hover:border-white/60 hover:text-white text-sm flex items-center justify-center transition-colors"
                        >−</button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          className="w-6 h-6 border border-white/20 text-white/60 hover:border-white/60 hover:text-white text-sm flex items-center justify-center transition-colors"
                        >+</button>
                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="ml-auto text-white/30 hover:text-red-400 text-xs tracking-widest uppercase transition-colors"
                        >Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50 tracking-widest uppercase text-xs">Subtotal</span>
                  <span className="font-semibold">GHS {totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-white/30">Shipping calculated at checkout</p>
                <button
                  onClick={() => {
                    closeCart();
                    router.push("/checkout");
                  }}
                  className="block w-full bg-white text-black text-center text-xs font-bold tracking-[0.2em] uppercase py-4 hover:bg-white/90 transition-colors touch-manipulation"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
