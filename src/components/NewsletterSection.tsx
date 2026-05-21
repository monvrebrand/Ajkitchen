"use client";

export default function NewsletterSection() {
  return (
    <section className="border-t border-white/5 py-24 px-6 bg-[#080808]">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-[9px] tracking-[0.35em] uppercase text-white/30 mb-4">Inner Circle</p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white/90 uppercase mb-4">
          Get Early Access
        </h2>
        <p className="text-sm text-white/50 mb-8">
          Series 02 drops first to the list. No noise, just drops.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 bg-white/5 border border-white/10 text-white text-xs px-5 py-4 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors"
          />
          <button
            type="submit"
            className="bg-white text-black text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 hover:bg-white/90 transition-colors flex-shrink-0"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
