import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sustainability MONVRE",
  description: "MONVRE's commitment to responsible production, material sourcing, and long-term garment lifecycle.",
};

export default function SustainabilityPage() {
  const pillars = [
    {
      icon: "◈",
      title: "Long-Life Fabrication",
      body: "Our 340gsm heavyweight construction is engineered to outlast fast fashion by a factor of 10. A garment that lasts 10 years has a fraction of the environmental cost of one that lasts one.",
    },
    {
      icon: "◇",
      title: "Responsible Sourcing",
      body: "Fabrics sourced from GOTS-certified mills in Portugal. Every supplier is audited annually for environmental compliance, worker welfare, and chemical safety.",
    },
    {
      icon: "○",
      title: "Low-Volume Drops",
      body: "Series 01 is deliberately limited. We produce only what we sell with no deadstock, no overproduction, no landfill. Each drop is a closed loop.",
    },
    {
      icon: "□",
      title: "Minimal Packaging",
      body: "All MONVRE shipments use unbleached, FSC-certified recycled cardboard. No tissue paper. No plastic bags. No excess.",
    },
    {
      icon: "◇",
      title: "Carbon Accounting",
      body: "We calculate the carbon footprint of every Series drop and offset 120% via verified reforestation projects in Brazil and Indonesia.",
    },
    {
      icon: "◎",
      title: "Repair Program",
      body: "Every MONVRE garment includes a lifetime repair pledge. Send it back damaged and we fix it free. We'd rather mend than manufacture.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-24 md:pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-4">Our Responsibility</p>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white/90 uppercase leading-none">
            Sustain&shy;ability
          </h1>
        </div>

        <div className="mb-16 md:mb-24 max-w-2xl">
          <p className="text-base md:text-lg text-white/60 leading-relaxed">
            Premium streetwear has an environmental cost. We don&apos;t pretend otherwise. What we do is build garments engineered to last and run a business built to cause less harm.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 mb-20 md:mb-32">
          {pillars.map((p) => (
            <div key={p.title} className="bg-[#050505] p-8 md:p-10">
              <span className="text-white/20 text-lg mb-6 block">{p.icon}</span>
              <h2 className="text-sm font-black tracking-tight text-white/90 uppercase mb-4">{p.title}</h2>
              <p className="text-sm text-white/45 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="border-t border-white/5 pt-16 md:pt-24 mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-12">Series 01 Targets</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
            {[
              { stat: "100%", label: "Recycled Packaging" },
              { stat: "120%", label: "Carbon Offset" },
              { stat: "0", label: "Deadstock Units" },
              { stat: "∞", label: "Repair Warranty" },
            ].map((s) => (
              <div key={s.label} className="bg-[#050505] p-7 md:p-10 text-center">
                <p className="text-3xl md:text-4xl font-black tracking-tighter text-white/90 mb-2">{s.stat}</p>
                <p className="text-[9px] text-white/35 tracking-widest uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-12">
          <Link href="/about" className="text-xs tracking-[0.25em] uppercase text-white/40 hover:text-white border-b border-white/20 hover:border-white pb-0.5 transition-all">
            ← Back to About
          </Link>
        </div>
      </div>
    </div>
  );
}
