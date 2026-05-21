import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Policy MONVRE",
  description: "MONVRE shipping rates, delivery timelines, and international shipping information.",
};

export default function ShippingPolicyPage() {
  const regions = [
    { region: "United States", standard: "5–8 business days", express: "2–3 business days" },
    { region: "Canada", standard: "7–12 business days", express: "3–5 business days" },
    { region: "United Kingdom", standard: "7–14 business days", express: "4–6 business days" },
    { region: "Europe (EU)", standard: "8–14 business days", express: "4–7 business days" },
    { region: "Asia Pacific", standard: "10–18 business days", express: "5–8 business days" },
    { region: "Rest of World", standard: "12–21 business days", express: "6–10 business days" },
  ];

  const faq = [
    {
      q: "When will my order ship?",
      a: "All Series 01 orders are processed within 1–3 business days. You will receive a tracking number via email once your order has shipped.",
    },
    {
      q: "Do you ship to PO Boxes?",
      a: "We ship to PO boxes via standard shipping only. Express shipping requires a physical address for carrier pickup.",
    },
    {
      q: "What carrier do you use?",
      a: "US domestic orders ship via UPS or USPS. International orders ship via DHL Express or USPS Priority Mail International, depending on destination.",
    },
    {
      q: "Am I responsible for customs and duties?",
      a: "International customers are responsible for all import duties, taxes, and customs fees. These are not included in shipping charges and are determined by your local customs authority.",
    },
    {
      q: "Can I change my shipping address after ordering?",
      a: "Address changes can be requested within 24 hours of placing your order. Contact us immediately at support@monvre.com. Once shipped, we cannot redirect packages.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-24 md:pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-4">Logistics</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white/90 uppercase leading-none">
            Shipping<br />Policy
          </h1>
          <p className="text-sm text-white/40 mt-6 max-w-lg leading-relaxed">
            Last updated: May 2026. We ship worldwide from our fulfillment center in Los Angeles, CA.
          </p>
        </div>

        {/* Rates Table */}
        <div className="mb-20 md:mb-28">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-8">Shipping Rates &amp; Timelines</p>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[400px] text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-[9px] tracking-widest uppercase text-white/30 pb-4 font-normal">Region</th>
                  <th className="text-left text-[9px] tracking-widest uppercase text-white/30 pb-4 font-normal">Standard</th>
                  <th className="text-left text-[9px] tracking-widest uppercase text-white/30 pb-4 font-normal">Express</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((r, i) => (
                  <tr key={r.region} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                    <td className="py-4 text-white/70 font-medium">{r.region}</td>
                    <td className="py-4 text-white/45">{r.standard}</td>
                    <td className="py-4 text-white/45">{r.express}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-10">Frequently Asked</p>
          <div className="space-y-0">
            {faq.map((item) => (
              <div key={item.q} className="border-t border-white/5 py-7">
                <p className="text-sm font-semibold text-white/80 mb-3">{item.q}</p>
                <p className="text-sm text-white/45 leading-relaxed max-w-2xl">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-wrap gap-6">
          <Link href="/returns" className="text-xs tracking-widest uppercase text-white/40 hover:text-white border-b border-white/20 hover:border-white pb-0.5 transition-all">
            Returns Policy →
          </Link>
          <Link href="/contact" className="text-xs tracking-widest uppercase text-white/40 hover:text-white border-b border-white/20 hover:border-white pb-0.5 transition-all">
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
