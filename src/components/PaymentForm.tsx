"use client";

import { useState } from "react";
import Script from "next/script";

const PROVIDERS = [
  { value: "mtn",      label: "MTN Mobile Money" },
  { value: "vodafone", label: "Telecel (Vodafone)" },
  { value: "tigo",     label: "AirtelTigo" },
];

type Method = "card" | "mobile_money" | null;
type MoMoStage = "form" | "awaiting";

interface Props {
  email: string;
  amount: number; // USD
  onCardSuccess: (reference: string) => void;
  onMomoInitiated: (reference: string) => void;
  onError: (msg: string) => void;
}

export default function PaymentForm({ email, amount, onCardSuccess, onMomoInitiated, onError }: Props) {
  const [method, setMethod]     = useState<Method>(null);
  const [momoStage, setMomoStage] = useState<MoMoStage>("form");
  const [paystackReady, setPaystackReady] = useState(false);
  const [busy, setBusy]         = useState(false);
  const [momo, setMomo]         = useState({ phone: "", provider: "mtn" });

  const inp = "w-full bg-white border border-pink-100 text-pink-700 text-xs px-4 py-4 placeholder:text-pink-200 focus:outline-none focus:border-pink-500 transition-colors font-bold rounded-sm";

  const openCardPopup = () => {
    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) { onError("Payment system not loaded. Please refresh."); return; }
    const handler = PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amount * 100),
      currency: "USD",
      channels: ["card"],
      ref: `AJ-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      callback: (response: { reference: string }) => {
        onCardSuccess(response.reference);
      },
      onClose: () => {},
    });
    handler.openIframe();
  };

  const submitMomo = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res  = await fetch("/api/paystack/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "mobile_money",
          email, amount,
          phone: momo.phone,
          provider: momo.provider,
        }),
      });
      const data = await res.json();
      const ref  = data.data?.reference;
      if (!data.status && !ref) {
        onError(data.message || "Could not initiate MoMo payment.");
      } else {
        setMomoStage("awaiting");
        onMomoInitiated(ref);
      }
    } catch { onError("Network error. Please try again."); }
    setBusy(false);
  };

  if (!method) {
    return (
      <>
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
          onLoad={() => setPaystackReady(true)}
        />
        <div className="space-y-4">
          <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 mb-5 font-black">Choose Payment Method</p>
          {[
            { id: "card" as Method,         icon: "💳", label: "Debit / Credit Card",  sub: "Secure payment via Visa, Mastercard" },
            { id: "mobile_money" as Method, icon: "📱", label: "Mobile Money",          sub: "Available for African payment accounts" },
          ].map(m => (
            <button key={m.id!} onClick={() => setMethod(m.id)}
              className="w-full flex items-center gap-4 bg-pink-50/20 border border-pink-100 hover:border-pink-300 hover:bg-pink-50/50 p-5 transition-all text-left group rounded-sm shadow-sm">
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-black text-pink-700 uppercase tracking-tight">{m.label}</p>
                <p className="text-[9px] text-pink-400 font-bold mt-0.5">{m.sub}</p>
              </div>
              <span className="text-pink-200 group-hover:text-pink-500 transition-colors font-black">→</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  if (method === "card") {
    return (
      <>
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
          onLoad={() => setPaystackReady(true)}
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 font-black">Card Payment</p>
            <button onClick={() => setMethod(null)} className="text-[9px] uppercase tracking-widest text-pink-300 hover:text-pink-600 transition-colors font-black">← Back</button>
          </div>
          <div className="bg-green-50 border border-green-100 p-4 flex gap-3 items-start rounded-sm">
            <span className="text-green-600 text-sm mt-0.5">🔒</span>
            <div>
              <p className="text-[9px] text-green-600 font-black tracking-widest uppercase mb-1">Encrypted Transaction</p>
              <p className="text-[9px] text-green-500 font-bold leading-relaxed">
                Your card details are processed securely. AJ KITCHEN never stores your credit card information.
              </p>
            </div>
          </div>
          <button
            onClick={openCardPopup}
            disabled={!paystackReady}
            className="w-full bg-pink-500 text-white text-xs font-black tracking-[0.25em] uppercase py-5 hover:bg-pink-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 rounded-sm shadow-lg">
            {paystackReady ? `Pay $ ${amount} Securely →` : "Preparing Secure Vault…"}
          </button>
        </div>
      </>
    );
  }

  if (momoStage === "awaiting") {
    return (
      <div className="text-center py-4">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border border-pink-200 animate-ping opacity-30" />
          <div className="relative w-16 h-16 rounded-full border border-pink-100 bg-pink-50 flex items-center justify-center text-xl shadow-inner">📱</div>
        </div>
        <p className="text-xs text-pink-400 font-bold mb-1">MoMo prompt sent to</p>
        <p className="text-sm font-mono font-black text-pink-700 mb-4">{momo.phone}</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          <span className="text-[10px] text-pink-400 ml-2 tracking-widest uppercase font-black">Waiting for approval</span>
        </div>
        <p className="text-[10px] text-pink-300 font-bold">Please approve on your device. Do not refresh.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submitMomo} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 font-black">Mobile Money</p>
        <button type="button" onClick={() => setMethod(null)} className="text-[9px] uppercase tracking-widest text-pink-300 hover:text-pink-600 transition-colors font-black">← Back</button>
      </div>
      <select value={momo.provider} onChange={e => setMomo(m => ({ ...m, provider: e.target.value }))}
        className={inp + " cursor-pointer bg-pink-50/30"}>
        {PROVIDERS.map(p => <option key={p.value} value={p.value} className="text-pink-700">{p.label}</option>)}
      </select>
      <input required type="tel" placeholder="Mobile Money Number"
        value={momo.phone} onChange={e => setMomo(m => ({ ...m, phone: e.target.value }))}
        className={inp} />
      <p className="text-[10px] text-pink-400 font-medium leading-relaxed">
        A <strong className="text-pink-600">$ {amount}</strong> prompt will be sent to your phone.
      </p>
      <button type="submit" disabled={busy}
        className="w-full bg-pink-500 text-white text-xs font-black tracking-[0.25em] uppercase py-5 hover:bg-pink-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 mt-2 rounded-sm shadow-lg">
        {busy
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Requesting PIN…</>
          : `Pay $ ${amount} via MoMo`}
      </button>
    </form>
  );
}
