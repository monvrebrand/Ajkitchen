import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About MONVRE — Series 01",
  description: "The story behind MONVRE — premium tech-garment streetwear engineered at the intersection of art and utility.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24 md:pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-4">Our Story</p>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white/90 uppercase leading-none">
            About<br />MONVRE
          </h1>
        </div>

        {/* Intro */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-20 md:mb-32">
          <div>
            <p className="text-base md:text-lg text-white/60 leading-relaxed">
              MONVRE was founded at the intersection of technical fabrication and streetwear identity — two worlds that had never truly converged until now.
            </p>
          </div>
          <div>
            <p className="text-sm text-white/45 leading-relaxed">
              Our name derives from the French word for &ldquo;to show&rdquo; — a philosophy embedded in everything we create. We don&apos;t design clothes. We engineer statements.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="border-t border-white/5 pt-16 md:pt-24 mb-20 md:mb-32">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-12">Core Values</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
            {[
              {
                num: "01",
                title: "Engineered Precision",
                body: "Every seam, every panel, every stitch is calculated. We don't believe in coincidence in craftsmanship.",
              },
              {
                num: "02",
                title: "Material Integrity",
                body: "We source only 340gsm+ heavyweight fabrics. Lightweights are not in our vocabulary.",
              },
              {
                num: "03",
                title: "Visual Language",
                body: "Screen-print graphics that tell a story. Not decoration — communication.",
              },
            ].map((v) => (
              <div key={v.num} className="bg-[#050505] p-8 md:p-10">
                <p className="text-xs font-mono text-white/20 mb-6">{v.num}</p>
                <h2 className="text-lg font-black tracking-tight text-white/90 uppercase mb-4">{v.title}</h2>
                <p className="text-sm text-white/45 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="border-t border-white/5 pt-16 md:pt-24 mb-20 md:mb-32">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-12">Timeline</p>
          <div className="space-y-10 md:space-y-12 relative">
            <div className="absolute left-[3.5rem] md:left-24 top-0 bottom-0 w-px bg-white/5" />
            {[
              { year: "2023", event: "MONVRE concept developed. First technical fabric sourced from Portugal." },
              { year: "2024", event: "Series 01 garment engineering begins. Japanese construction partners confirmed." },
              { year: "2025", event: "Series 01 pre-production samples approved. Launch campaign created." },
              { year: "2026", event: "Series 01 officially launches. Pre-orders open to the Inner Circle." },
            ].map((t) => (
              <div key={t.year} className="flex gap-8 md:gap-16 items-start">
                <div className="w-14 md:w-24 flex-shrink-0 text-right">
                  <span className="text-xs font-mono text-white/30">{t.year}</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/20 flex-shrink-0 mt-0.5 z-10" />
                <p className="text-sm text-white/55 leading-relaxed max-w-lg">{t.event}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-white/5 pt-16 flex flex-col sm:flex-row gap-4">
          <Link href="/store" className="inline-block bg-white text-black text-xs font-bold tracking-[0.25em] uppercase px-10 py-4 hover:bg-white/90 transition-colors text-center">
            Shop Series 01
          </Link>
          <Link href="/contact" className="inline-block border border-white/20 text-xs tracking-[0.25em] uppercase px-10 py-4 hover:bg-white hover:text-black transition-all text-white/60 text-center">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
