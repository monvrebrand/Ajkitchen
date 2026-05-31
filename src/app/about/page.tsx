import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story | AJ KITCHEN",
  description: "The story behind AJ KITCHEN — homemade Ghanaian and African meals delivered fresh in Columbus, Ohio.",
};

export default function AboutPage() {
  const brandPink = "text-[#db2777]";

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-400 mb-4 font-black">The Kitchen Story</p>
          <h1 className={`text-5xl md:text-8xl font-black tracking-tighter ${brandPink} uppercase leading-none`}>
            About<br />AJ KITCHEN
          </h1>
        </div>

        {/* Intro */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-20 md:mb-32">
          <div>
            <p className="text-base md:text-lg text-pink-900 font-bold leading-relaxed">
              AJ KITCHEN was born from a passion for authentic West African flavors and the desire to share the warmth of Ghanaian hospitality with the Columbus community.
            </p>
          </div>
          <div>
            <p className="text-sm text-pink-700/60 font-bold leading-relaxed">
              We believe that food is a bridge between cultures. Every plate of Jollof rice or Waakye we serve is a piece of our heritage, prepared with traditional spices and the same care we give to our own family.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="border-t border-pink-100 pt-16 md:pt-24 mb-20 md:mb-32">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-400 mb-12 font-black">Our Philosophy</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-pink-100 shadow-sm border border-pink-100">
            {[
              {
                num: "01",
                title: "Authentic Spices",
                body: "We source traditional ingredients to ensure every meal tastes exactly like a homemade feast in Accra.",
              },
              {
                num: "02",
                title: "Made to Order",
                body: "No mass production. Every order is small-batch and prepared specifically for your weekend delivery.",
              },
              {
                num: "03",
                title: "Columbus Roots",
                body: "Proudly based in Ohio, we are dedicated to serving our local neighbors with the best African cuisine.",
              },
            ].map((v) => (
              <div key={v.num} className="bg-white p-8 md:p-10">
                <p className="text-xs font-mono text-pink-300 mb-6 font-black">{v.num}</p>
                <h2 className={`text-lg font-black ${brandPink} uppercase mb-4`}>{v.title}</h2>
                <p className="text-sm text-pink-400 font-bold leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="border-t border-pink-100 pt-16 md:pt-24 mb-20 md:mb-32">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-400 mb-12 font-black">Weekly Routine</p>
          <div className="space-y-10 md:space-y-12 relative">
            <div className="absolute left-[3.5rem] md:left-24 top-0 bottom-0 w-0.5 bg-pink-100" />
            {[
              { year: "Mon-Fri", event: "Pre-orders are open! Secure your weekend meals by browsing our latest menu drops." },
              { year: "Saturday", event: "Morning prep and lunch delivery. We bring the authentic heat to your doorstep." },
              { year: "Sunday", event: "Dinner delivery and family feast drops. The perfect way to end your week." },
            ].map((t) => (
              <div key={t.year} className="flex gap-8 md:gap-16 items-start">
                <div className="w-14 md:w-24 flex-shrink-0 text-right">
                  <span className="text-xs font-mono text-pink-500 font-black">{t.year}</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#db2777] flex-shrink-0 mt-0.5 z-10 shadow-sm" />
                <p className={`text-sm ${brandPink} font-black leading-relaxed max-w-lg uppercase tracking-tight`}>{t.event}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-pink-100 pt-16 flex flex-col sm:flex-row gap-4">
          <Link href="/store" className="inline-block bg-[#db2777] text-white text-xs font-black tracking-[0.25em] uppercase px-10 py-5 hover:bg-[#be185d] transition-all text-center rounded-sm shadow-lg">
            Order a Feast
          </Link>
          <Link href="/contact" className="inline-block border-2 border-pink-100 text-xs tracking-[0.25em] uppercase px-10 py-5 hover:bg-pink-50 text-pink-400 font-black transition-all text-center rounded-sm">
            Contact Kitchen
          </Link>
        </div>
      </div>
    </div>
  );
}
