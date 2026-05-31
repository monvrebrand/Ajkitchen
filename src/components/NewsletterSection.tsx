"use client";

import { useEffect, useState } from "react";

export default function NewsletterSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const brandPink = "text-[#db2777]";

  return (
    <section className="border-t border-pink-100 py-24 px-6 bg-pink-50/10 relative z-10">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-[9px] tracking-[0.35em] uppercase text-pink-400 mb-4 font-black">Weekly Specials</p>
        <h2 className={`text-3xl md:text-4xl font-black tracking-tighter ${brandPink} uppercase mb-4`}>
          Don&apos;t Miss the Drop
        </h2>
        <p className="text-sm text-pink-700/70 mb-8 font-bold">
          Get notified when the menu updates and pre-orders open every Monday.
        </p>

        {mounted ? (
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white border-2 border-pink-100 text-pink-700 text-xs px-5 py-4 placeholder:text-pink-300 focus:outline-none focus:border-pink-500 transition-colors rounded-sm font-bold shadow-sm"
            />
            <button
              type="submit"
              className="bg-[#db2777] text-white text-xs font-black tracking-[0.2em] uppercase px-10 py-4 hover:bg-[#be185d] transition-colors flex-shrink-0 shadow-md rounded-sm"
            >
              Join Kitchen
            </button>
          </form>
        ) : (
          <div className="h-[60px] max-w-md mx-auto" />
        )}
      </div>
    </section>
  );
}
