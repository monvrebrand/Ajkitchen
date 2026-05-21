"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type OrderResult = {
  id: string; status: string; created_at: string; total: number; currency: string;
  items: { name: string; qty: number; size: string }[];
  shipping_address: string; shipping_city: string;
  tracking_number?: string;
  shipping_fee?: number;
};

const STATUS_STEPS = ["Processing", "Shipped", "In Transit", "Delivered"];

const statusColor: Record<string, string> = {
  Delivered:    "bg-green-500/20 text-green-400",
  "In Transit": "bg-blue-500/20 text-blue-400",
  Shipped:      "bg-cyan-500/20 text-cyan-400",
  Processing:   "bg-amber-500/20 text-amber-400",
  Pending:      "bg-white/10 text-white/40",
  Cancelled:    "bg-red-500/20 text-red-400",
};

export default function TrackOrderPage() {
  const [orderNum, setOrderNum] = useState("");
  const [result, setResult] = useState<OrderResult | null | "not-found">(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(orderNum.trim().toUpperCase())}`);
      const data = await res.json();
      setResult(data.error || !data.id ? "not-found" : data);
    } catch {
      setResult("not-found");
    }
    setLoading(false);
  };

  const order = result && result !== "not-found" ? result : null;
  const stepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-[#050505] pt-20 md:pt-28 pb-16 md:pb-24">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[9px] tracking-[0.35em] uppercase text-white/30 mb-3">Logistics</p>
          <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-white/90 uppercase mb-4">Track Order</h1>
          <p className="text-sm text-white/40 mb-8 md:mb-12 leading-relaxed">
            Enter your order number from your confirmation email.
          </p>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mb-10 md:mb-12">
            <input
              type="text" value={orderNum} onChange={e => setOrderNum(e.target.value)}
              placeholder="MV-000000" required
              className="flex-1 bg-white/5 border border-white/10 text-white text-sm px-5 py-4 placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors font-mono"
            />
            <button type="submit" disabled={loading}
              className="bg-white text-black text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 hover:bg-white/90 transition-colors disabled:opacity-50 flex-shrink-0 flex items-center gap-2 justify-center">
              {loading ? <><span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Tracking…</> : "Track"}
            </button>
          </form>

          {result === "not-found" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="border border-red-500/20 p-6 text-center">
              <p className="text-xs text-red-400 tracking-widest uppercase">Order not found</p>
              <p className="text-xs text-white/40 mt-2">Check your confirmation email and try again.</p>
            </motion.div>
          )}

          {order && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border border-white/5 bg-white/[0.02] p-6">
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-1">Order</p>
                  <p className="text-lg font-mono font-bold text-white/90">{order.id}</p>
                  <p className="text-[10px] text-white/30 mt-1">
                    {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-2">Status</p>
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm ${statusColor[order.status] || "bg-white/10 text-white/40"}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="border border-white/5 p-6">
                <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-8">Shipment Progress</p>
                <div className="relative">
                  <div className="absolute left-[7px] top-0 bottom-0 w-px bg-white/10" />
                  <div className="space-y-6">
                    {STATUS_STEPS.map((step, i) => {
                      const done = stepIndex >= i;
                      const current = stepIndex === i;
                      return (
                        <div key={step} className="flex items-center gap-4">
                          <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 z-10 transition-colors ${
                            done ? "bg-white" : "bg-white/10 border border-white/15"
                          } ${current ? "ring-2 ring-white/20 ring-offset-2 ring-offset-[#050505]" : ""}`} />
                          <p className={`text-xs tracking-widest uppercase ${done ? "text-white/80" : "text-white/20"}`}>{step}</p>
                          {current && <span className="text-[9px] text-white/30 tracking-widest uppercase ml-auto">Current</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tracking Number — shown when set */}
              {order.tracking_number && (
                <div className="border border-cyan-500/20 bg-cyan-500/5 p-6">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-cyan-400/60 mb-3">📦 Tracking Number</p>
                  <p className="text-2xl font-mono font-black text-cyan-300 tracking-wider mb-2">{order.tracking_number}</p>
                  <p className="text-[10px] text-white/30 leading-relaxed">
                    Use this number on your courier&apos;s website to track your shipment in real time.
                  </p>
                </div>
              )}

              {/* Items + Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-white/5 p-6">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-4">Items</p>
                  <ul className="space-y-2">
                    {order.items?.map((item, i) => (
                      <li key={i} className="text-xs text-white/60">{item.name} ({item.size}) × {item.qty}</li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
                    <p className="text-xs text-white/40 flex justify-between">
                      <span>Total Paid (excl. shipping)</span>
                      <span>{order.currency} {Number(order.total).toFixed(2)}</span>
                    </p>
                    {order.shipping_fee !== undefined && order.shipping_fee !== null && (
                      <p className="text-xs text-amber-400 font-bold flex justify-between">
                        <span className="uppercase tracking-widest text-[9px]">Shipping Fee</span>
                        <span>{order.currency} {Number(order.shipping_fee).toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="border border-white/5 p-6">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-4">Shipping To</p>
                  <p className="text-xs text-white/60 leading-relaxed">{order.shipping_address}</p>
                  <p className="text-xs text-white/40 mt-1">{order.shipping_city}</p>
                </div>
              </div>

              <Link href="/store"
                className="block text-center border border-white/10 text-xs tracking-widest uppercase py-4 text-white/50 hover:text-white hover:border-white/30 transition-all">
                Continue Shopping
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
