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
            className="fixed inset-0 z-[600] bg-pink-900/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[700] w-full max-w-md bg-white border-l border-pink-100 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-pink-50 bg-pink-50/50">
              <h2 className="text-sm tracking-[0.25em] uppercase font-black text-pink-600">
                Your Feast {items.length > 0 && `(${items.length})`}
              </h2>
              <button onClick={closeCart} className="text-pink-300 hover:text-pink-600 transition-colors">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-2">
                    <span className="text-3xl opacity-50">🥘</span>
                  </div>
                  <p className="text-pink-300 text-sm tracking-widest uppercase font-black">Your bag is empty</p>
                  <button
                    onClick={() => {
                      closeCart();
                      router.push("/store");
                    }}
                    className="text-xs tracking-[0.2em] uppercase text-pink-600 border-2 border-pink-200 px-8 py-3 hover:bg-pink-500 hover:text-white transition-all font-black rounded-sm"
                  >
                    See Menu
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 p-3 bg-white border border-pink-50 rounded-sm shadow-sm">
                    <div className="relative w-20 h-20 bg-pink-50 flex-shrink-0 rounded-sm overflow-hidden border border-pink-100">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-pink-700 truncate uppercase tracking-tight">{item.name}</p>
                      <p className="text-[10px] text-pink-400 mt-0.5 font-bold uppercase tracking-wider">Portion: {item.size}</p>
                      <p className="text-sm text-pink-500 mt-1 font-black">$ {item.price}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-pink-100 rounded-sm bg-pink-50/30 overflow-hidden">
                           <button
                             onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                             className="w-8 h-8 text-pink-400 hover:bg-pink-500 hover:text-white transition-colors font-black"
                           >−</button>
                           <span className="text-xs w-8 text-center text-pink-700 font-black">{item.quantity}</span>
                           <button
                             onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                             className="w-8 h-8 text-pink-400 hover:bg-pink-500 hover:text-white transition-colors font-black"
                           >+</button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="ml-auto text-pink-300 hover:text-red-500 text-[10px] tracking-widest uppercase transition-colors font-black underline underline-offset-2"
                        >Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-6 border-t border-pink-100 space-y-4 bg-pink-50/30 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-pink-400 tracking-[0.2em] uppercase text-[10px] font-black">Subtotal</span>
                  <span className="font-black text-pink-700 text-xl">$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 p-3 rounded-sm border border-pink-100/50">
                  <span className="text-lg">🚚</span>
                  <p className="text-[10px] text-pink-400 font-bold uppercase leading-tight">Deliveries every Sat & Sun in Columbus</p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    router.push("/checkout");
                  }}
                  className="block w-full bg-pink-500 text-white text-center text-xs font-black tracking-[0.2em] uppercase py-5 hover:bg-pink-600 transition-colors shadow-lg rounded-sm"
                >
                  Checkout Now
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
