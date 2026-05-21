import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Exchanges MONVRE",
  description: "MONVRE returns, exchanges, and repair policy. We stand behind every garment we make.",
};

export default function ReturnsPage() {
  const steps = [
    { num: "01", title: "Contact Us", body: "Email returns@monvre.com within 30 days of delivery with your order number and reason for return." },
    { num: "02", title: "Receive Label", body: "We'll email you a prepaid return shipping label within 1 business day. US returns are always free." },
    { num: "03", title: "Pack & Ship", body: "Carefully pack the item in its original packaging. Drop it off at any UPS or USPS location." },
    { num: "04", title: "Refund Issued", body: "Once received and inspected, your refund will be issued within 5 business days to your original payment method." },
  ];

  const faq = [
    { q: "What is the return window?", a: "30 days from the date of delivery. Items must be unworn, unwashed, and in original condition with all tags attached." },
    { q: "Can I exchange for a different size?", a: "Yes. Exchanges for a different size are always free of charge. Request an exchange at returns@monvre.com and we'll send you the new size as soon as your return is received." },
    { q: "What items are final sale?", a: "Accessories (caps, bags) marked as final sale at checkout are non-returnable. Gift cards are non-refundable." },
    { q: "My item arrived damaged. What do I do?", a: "Please photograph the damage and email us at support@monvre.com within 7 days of delivery. We will arrange a free replacement or full refund immediately." },
    { q: "Do you offer lifetime repairs?", a: "Yes. Under our Repair Pledge, any MONVRE garment can be returned for free repair at any time: stitching, zips, seams. This never expires." },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-24 md:pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-4">Customer Promise</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white/90 uppercase leading-none">
            Returns &amp;<br />Exchanges
          </h1>
          <p className="text-sm text-white/40 mt-6 max-w-lg leading-relaxed">
            We stand behind every garment we make. If it&apos;s not right, we&apos;ll make it right.
          </p>
        </div>

        {/* At a glance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 mb-20 md:mb-28">
          {[
            { stat: "30 Days", label: "Return Window" },
            { stat: "Free", label: "US Returns" },
            { stat: "5 Days", label: "Refund Speed" },
            { stat: "∞", label: "Repair Warranty" },
          ].map((s) => (
            <div key={s.label} className="bg-[#050505] p-6 md:p-8 text-center">
              <p className="text-2xl md:text-3xl font-black tracking-tighter text-white/90 mb-1">{s.stat}</p>
              <p className="text-[9px] text-white/35 tracking-widest uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mb-20 md:mb-28">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-12">How it Works</p>
          <div className="grid md:grid-cols-2 gap-px bg-white/5">
            {steps.map((s) => (
              <div key={s.num} className="bg-[#050505] p-8 md:p-10">
                <span className="text-xs font-mono text-white/20 block mb-5">{s.num}</span>
                <h2 className="text-sm font-black tracking-tight text-white/90 uppercase mb-3">{s.title}</h2>
                <p className="text-sm text-white/45 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16 md:mb-20">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-10">Common Questions</p>
          <div className="space-y-0">
            {faq.map((item) => (
              <div key={item.q} className="border-t border-white/5 py-7">
                <p className="text-sm font-semibold text-white/80 mb-3">{item.q}</p>
                <p className="text-sm text-white/45 leading-relaxed max-w-2xl">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-wrap gap-6">
          <Link href="/shipping-policy" className="text-xs tracking-widest uppercase text-white/40 hover:text-white border-b border-white/20 hover:border-white pb-0.5 transition-all">
            Shipping Policy →
          </Link>
          <Link href="/contact" className="text-xs tracking-widest uppercase text-white/40 hover:text-white border-b border-white/20 hover:border-white pb-0.5 transition-all">
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
