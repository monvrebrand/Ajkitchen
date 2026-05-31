import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quality & Sourcing | AJ KITCHEN",
  description: "AJ KITCHEN commitment to fresh ingredients, traditional methods, and responsible packaging.",
};

export default function SustainabilityPage() {
  const pillars = [
    {
      icon: "◈",
      title: "Fresh Daily Ingredients",
      body: "We source our vegetables and proteins from local Columbus markets every week. No frozen preservatives, just fresh, wholesome ingredients for your family.",
    },
    {
      icon: "◇",
      title: "Authentic Spices",
      body: "Our signature flavors come from authentic Ghanaian spices, including high-quality ginger, chili, and traditional soup bases imported directly for that true home taste.",
    },
    {
      icon: "○",
      title: "Zero Waste Kitchen",
      body: "We operate on a pre-order model. By knowing exactly what our community needs by Friday, we eliminate food waste and ensure every meal is made specifically for you.",
    },
    {
      icon: "□",
      title: "Eco-Friendly Packaging",
      body: "We use recyclable aluminum containers and biodegradable paper bags. We're committed to keeping our community clean while keeping your food hot and fresh.",
    },
    {
      icon: "◇",
      title: "Community Support",
      body: "Based in Columbus, we prioritize working with local delivery drivers and vendors to keep the economic benefits within our Ohio community.",
    },
    {
      icon: "◎",
      title: "Traditional Methods",
      body: "Our Jollof and Waakye are slow-cooked using time-honored techniques. We don't take shortcuts when it comes to the depth of flavor your meals deserve.",
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-400 mb-4 font-black">Our Commitment</p>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-pink-600 uppercase leading-none">
            Quality &amp;<br />Sourcing
          </h1>
        </div>

        <div className="mb-16 md:mb-24 max-w-2xl">
          <p className="text-base md:text-lg text-pink-800/80 font-bold leading-relaxed">
            Homemade food is about more than just taste; it&apos;s about trust. At AJ KITCHEN, we believe in radical transparency regarding our ingredients and cooking processes.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-pink-100 mb-20 md:mb-32">
          {pillars.map((p) => (
            <div key={p.title} className="bg-white p-8 md:p-10">
              <span className="text-pink-300 text-lg mb-6 block">{p.icon}</span>
              <h2 className="text-sm font-black tracking-tight text-pink-600 uppercase mb-4">{p.title}</h2>
              <p className="text-sm text-pink-400 font-medium leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="border-t border-pink-100 pt-16 md:pt-24 mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-300 mb-12 font-black">Our Kitchen Standards</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-pink-100">
            {[
              { stat: "100%", label: "Fresh Ingredients" },
              { stat: "0%", label: "Added Preservatives" },
              { stat: "Local", label: "Columbus Sourced" },
              { stat: "Traditional", label: "Slow-Cooked" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-7 md:p-10 text-center shadow-sm">
                <p className="text-3xl md:text-4xl font-black tracking-tighter text-pink-600 mb-2">{s.stat}</p>
                <p className="text-[9px] text-pink-300 tracking-widest uppercase font-black">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-pink-100 pt-12">
          <Link href="/about" className="text-xs tracking-[0.25em] uppercase text-pink-300 hover:text-pink-600 border-b-2 border-pink-100 hover:border-pink-500 pb-1 transition-all font-black">
            ← Back to About
          </Link>
        </div>
      </div>
    </div>
  );
}
