import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delivery Policy | AJ KITCHEN",
  description: "AJ KITCHEN delivery zones, weekend schedules, and pre-ordering information in Columbus, Ohio.",
};

export default function ShippingPolicyPage() {
  const regions = [
    { region: "Columbus (Downtown)", standard: "Saturday 11am-2pm", express: "Sunday 11am-2pm" },
    { region: "Westerville", standard: "Saturday 12pm-3pm", express: "Sunday 12pm-3pm" },
    { region: "Dublin", standard: "Saturday 1pm-4pm", express: "Sunday 1pm-4pm" },
    { region: "New Albany", standard: "Saturday 12pm-3pm", express: "Sunday 12pm-3pm" },
    { region: "Hilliard", standard: "Saturday 1pm-4pm", express: "Sunday 1pm-4pm" },
    { region: "Gahanna", standard: "Saturday 11am-2pm", express: "Sunday 11am-2pm" },
  ];

  const faq = [
    {
      q: "When will my meal arrive?",
      a: "We deliver every Saturday and Sunday. All pre-orders placed between Monday and Friday are processed for the coming weekend. You will receive a text notification when our driver is on the way.",
    },
    {
      q: "Do you offer weekday delivery?",
      a: "Currently, we specialize in weekend deliveries to ensure the highest quality and freshness of our homemade meals. Weekdays are dedicated to sourcing fresh ingredients and preparing our signature sauces.",
    },
    {
      q: "What is the delivery fee?",
      a: "Delivery fees are calculated based on your distance from our kitchen in Columbus. Standard fees range from $5 to $12 depending on the zone.",
    },
    {
      q: "Can I pick up my order?",
      a: "Yes! Pickup options are available on Saturdays from our central kitchen location. Select 'Pickup' during checkout to see the address and available time slots.",
    },
    {
      q: "Can I change my delivery address?",
      a: "Address changes can be requested until Friday 12pm. Contact us immediately at support@winningedgeinvestment.com to update your details.",
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-400 mb-4 font-black">Logistics</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-pink-600 uppercase leading-none">
            Delivery<br />Policy
          </h1>
          <p className="text-sm text-pink-400 font-bold mt-6 max-w-lg leading-relaxed">
            Last updated: May 2026. Serving the greater Columbus, Ohio area with authentic Ghanaian flavors.
          </p>
        </div>

        {/* Schedule Table */}
        <div className="mb-20 md:mb-28">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-300 mb-8 font-black">Delivery Zones & Schedule</p>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[400px] text-xs">
              <thead>
                <tr className="border-b border-pink-100">
                  <th className="text-left text-[9px] tracking-widest uppercase text-pink-300 pb-4 font-black">Area</th>
                  <th className="text-left text-[9px] tracking-widest uppercase text-pink-300 pb-4 font-black">Saturday Window</th>
                  <th className="text-left text-[9px] tracking-widest uppercase text-pink-300 pb-4 font-black">Sunday Window</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((r, i) => (
                  <tr key={r.region} className={`border-b border-pink-50 ${i % 2 === 0 ? "" : "bg-pink-50/10"}`}>
                    <td className="py-4 text-pink-700 font-black uppercase tracking-tight">{r.region}</td>
                    <td className="py-4 text-pink-500 font-bold">{r.standard}</td>
                    <td className="py-4 text-pink-500 font-bold">{r.express}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16 md:mb-24">
          <p className="text-[9px] tracking-[0.4em] uppercase text-pink-300 mb-10 font-black">Delivery FAQ</p>
          <div className="space-y-0">
            {faq.map((item) => (
              <div key={item.q} className="border-t border-pink-100 py-7">
                <p className="text-sm font-black text-pink-600 mb-3 uppercase tracking-tight">{item.q}</p>
                <p className="text-sm text-pink-400 font-medium leading-relaxed max-w-2xl">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-pink-100 pt-12 flex flex-wrap gap-6">
          <Link href="/returns" className="text-xs tracking-widest uppercase text-pink-300 hover:text-pink-600 border-b-2 border-pink-100 hover:border-pink-500 pb-1 transition-all font-black">
            Order Issues →
          </Link>
          <Link href="/contact" className="text-xs tracking-widest uppercase text-pink-300 hover:text-pink-600 border-b-2 border-pink-100 hover:border-pink-500 pb-1 transition-all font-black">
            Contact Kitchen →
          </Link>
        </div>
      </div>
    </div>
  );
}
