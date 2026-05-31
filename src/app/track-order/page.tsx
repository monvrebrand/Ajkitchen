"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

type OrderResult = {
  id: string; status: string; created_at: string; total: number; currency: string;
  items: { name: string; qty: number; size: string }[];
  shipping_address: string; shipping_city: string;
  tracking_number?: string;
  shipping_fee?: number;
};

const STATUS_STEPS = ["Order Received", "Preparing Feast", "Out for Delivery", "Delivered & Ready"];

const statusColor: Record<string, string> = {
  Delivered:          "bg-green-50 text-green-600 border border-green-200",
  "On the Way":       "bg-blue-50 text-blue-600 border border-blue-200",
  "Out for Delivery": "bg-cyan-50 text-cyan-600 border border-cyan-200",
  Preparing:          "bg-amber-50 text-amber-600 border border-amber-200",
  Processing:         "bg-pink-50 text-pink-600 border border-pink-200",
  Pending:            "bg-pink-50/30 text-pink-300 border border-pink-100",
  Cancelled:          "bg-red-50 text-red-600 border border-red-200",
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const [orderNum, setOrderNum] = useState("");
  const [result, setResult] = useState<OrderResult | null | "not-found">(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(id.trim().toUpperCase())}`);
      const data = await res.json();
      setResult(data.error || !data.id ? "not-found" : data);
    } catch {
      setResult("not-found");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (idParam) {
      setOrderNum(idParam);
      fetchOrder(idParam);
    }
  }, [idParam]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNum.trim()) return;
    fetchOrder(orderNum);
  };

  const order = result && result !== "not-found" ? result : null;

  const getStepIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending" || s === "processing") return 0;
    if (s === "preparing") return 1;
    if (s === "out for delivery" || s === "on the way") return 2;
    if (s === "delivered") return 3;
    return -1;
  };

  const stepIndex = order ? getStepIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-28 pb-16 md:pb-24">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[9px] tracking-[0.35em] uppercase text-pink-400 mb-3 font-black">Logistics</p>
          <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-pink-600 uppercase mb-4 leading-tight">Track Your Meal</h1>
          <p className="text-sm text-pink-400 font-bold mb-8 md:mb-12 leading-relaxed">
            Enter your order number to see when your food will arrive.
          </p>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mb-10 md:mb-12">
            <input
              type="text" value={orderNum} onChange={e => setOrderNum(e.target.value)}
              placeholder="AJK-000000" required
              className="flex-1 bg-white border-2 border-pink-100 text-pink-700 text-sm px-5 py-4 placeholder:text-pink-200 focus:outline-none focus:border-pink-500 transition-colors font-mono rounded-sm shadow-sm"
            />
            <button type="submit" disabled={loading}
              className="bg-pink-500 text-white text-xs font-black tracking-[0.2em] uppercase px-10 py-4 hover:bg-pink-600 transition-colors disabled:opacity-50 flex-shrink-0 flex items-center gap-2 justify-center rounded-sm shadow-md">
              {loading ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Tracking…</> : "Track Order"}
            </button>
          </form>

          {result === "not-found" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="border-2 border-red-100 bg-red-50 p-6 text-center rounded-sm">
              <p className="text-xs text-red-500 tracking-widest uppercase font-black">Order not found</p>
              <p className="text-xs text-red-400 mt-2 font-bold">Check your confirmation email and try again.</p>
            </motion.div>
          )}

          {order && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between border border-pink-100 bg-pink-50/20 p-6 rounded-sm">
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-1 font-black">Order ID</p>
                  <p className="text-lg font-mono font-black text-pink-700">{order.id}</p>
                  <p className="text-[10px] text-pink-400 mt-1 font-bold">
                    {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-2 font-black">Status</p>
                  <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-sm ${statusColor[order.status] || "bg-pink-50 text-pink-300"}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="border border-pink-100 p-6 rounded-sm shadow-sm bg-white">
                <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-8 font-black">Delivery Progress</p>
                <div className="relative">
                  <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-pink-100" />
                  <div className="space-y-6">
                    {STATUS_STEPS.map((step, i) => {
                      const done = stepIndex >= i;
                      const current = stepIndex === i;
                      return (
                        <div key={step} className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full flex-shrink-0 z-10 transition-colors ${
                            done ? "bg-pink-500" : "bg-white border-2 border-pink-100"
                          } ${current ? "ring-4 ring-pink-100" : ""}`} />
                          <p className={`text-xs tracking-widest uppercase font-black ${done ? "text-pink-600" : "text-pink-200"}`}>{step}</p>
                          {current && <span className="text-[9px] text-pink-400 tracking-widest uppercase ml-auto font-black italic">Current</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-pink-100 p-6 rounded-sm bg-white shadow-sm">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-4 font-black">Meals</p>
                  <ul className="space-y-3">
                    {order.items?.map((item, i) => (
                      <li key={i} className="text-xs text-pink-700 font-bold uppercase">{item.name} ({item.size}) × {item.qty}</li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-4 border-t border-pink-50 space-y-2">
                    <p className="text-xs text-pink-400 font-bold flex justify-between uppercase tracking-tighter">
                      <span>Subtotal</span>
                      <span>{order.currency} {Number(order.total).toFixed(2)}</span>
                    </p>
                    {order.shipping_fee && (
                      <p className="text-xs text-pink-600 font-black flex justify-between bg-pink-50 p-2 rounded-sm uppercase tracking-tighter">
                        <span>Delivery Fee</span>
                        <span>{order.currency} {Number(order.shipping_fee).toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="border border-pink-100 p-6 rounded-sm bg-white shadow-sm">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-4 font-black">Delivering To</p>
                  <p className="text-xs text-pink-700 font-black leading-relaxed uppercase">{order.shipping_address}</p>
                  <p className="text-xs text-pink-400 font-bold mt-1 uppercase">{order.shipping_city}</p>
                </div>
              </div>

              <Link href="/store"
                className="block text-center border-2 border-pink-100 text-xs tracking-widest uppercase py-4 text-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-all font-black rounded-sm">
                Order More Food
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white pt-20 md:pt-28 pb-16 md:pb-24">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          <div className="py-16 text-center text-pink-200 text-xs tracking-widest uppercase animate-pulse font-black">
            Loading Tracker…
          </div>
        </div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
