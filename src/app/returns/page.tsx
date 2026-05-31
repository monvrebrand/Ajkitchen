import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order Issues & Refunds | AJ KITCHEN",
  description: "AJ KITCHEN policy on order issues, refunds, and meal satisfaction.",
};

export default function ReturnsPage() {
  const steps = [
    { num: "01", title: "Notify Us", body: "If there's an issue with your meal or delivery, email support@winningedgeinvestment.com within 2 hours of receiving your order." },
    { num: "02", title: "Photo Evidence", body: "Please include a clear photo of the meal and your order number so we can investigate with our kitchen team." },
    { num: "03", title: "Kitchen Review", body: "We'll review the issue immediately. If we made a mistake, we'll offer a redelivery or a credit for your next order." },
    { num: "04", title: "Resolution", body: "Approved refunds are processed within 24 hours back to your original payment method (Card or MoMo)." },
  ];

  const faq = [
    { q: "What if my food arrives cold?", a: "We use insulated thermal bags for all weekend deliveries. However, if your meal arrives below temperature, please notify us immediately. We recommend a quick 30-second reheat for the best experience." },
    { q: "Can I cancel my pre-order?", a: "Cancellations are accepted until Friday at 10am. After this time, we have already sourced fresh ingredients for your specific order and cannot offer a full refund." },
    { q: "What if an item is missing?", a: "We double-check every bag before it leaves our Columbus kitchen. If we missed something, we will either redeliver it immediately or issue a full refund for that specific item." },
    { q: "Are there allergen warnings?", a: "Yes. All meals are prepared in a kitchen that handles peanuts, fish, and eggs. Please check the 'Details' section of each meal on our Menu page before ordering." },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-400 mb-4 font-black">Customer Promise</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-pink-600 uppercase leading-none">
            Satisfaction<br />&amp; Refunds
          </h1>
          <p className="text-sm text-pink-400 font-bold mt-6 max-w-lg leading-relaxed">
            We take pride in our cooking. If your experience isn&apos;t perfect, we&apos;ll make it right.
          </p>
        </div>

        {/* At a glance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-pink-100 mb-20 md:mb-28 shadow-sm">
          {[
            { stat: "2 Hours", label: "Report Window" },
            { stat: "Fresh", label: "Cooked to Order" },
            { stat: "24 Hours", label: "Refund Speed" },
            { stat: "100%", label: "Satisfaction" },
          ].map((s) => (
            <div key={s.label} className="bg-white p-6 md:p-8 text-center">
              <p className="text-2xl md:text-3xl font-black tracking-tighter text-pink-600 mb-1">{s.stat}</p>
              <p className="text-[9px] text-pink-300 tracking-widest uppercase font-black">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mb-20 md:mb-28">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-300 mb-12 font-black">How We Handle Issues</p>
          <div className="grid md:grid-cols-2 gap-px bg-pink-100 border border-pink-100">
            {steps.map((s) => (
              <div key={s.num} className="bg-white p-8 md:p-10">
                <span className="text-xs font-mono text-pink-300 block mb-5 font-black">{s.num}</span>
                <h2 className="text-sm font-black text-pink-600 uppercase mb-3 tracking-tight">{s.title}</h2>
                <p className="text-sm text-pink-400 font-medium leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16 md:mb-20">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-300 mb-10 font-black">Common Questions</p>
          <div className="space-y-0">
            {faq.map((item) => (
              <div key={item.q} className="border-t border-pink-100 py-7">
                <p className="text-sm font-black text-pink-600 mb-3 uppercase tracking-tight">{item.q}</p>
                <p className="text-sm text-pink-400 font-medium leading-relaxed max-w-2xl">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-pink-100 pt-10 flex flex-wrap gap-6">
          <Link href="/shipping-policy" className="text-xs tracking-widest uppercase text-pink-300 hover:text-pink-600 border-b-2 border-pink-100 hover:border-pink-500 pb-1 transition-all font-black">
            Delivery Policy →
          </Link>
          <Link href="/contact" className="text-xs tracking-widest uppercase text-pink-300 hover:text-pink-600 border-b-2 border-pink-100 hover:border-pink-500 pb-1 transition-all font-black">
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
