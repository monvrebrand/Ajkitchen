"use client";

import { useState, useRef } from "react";
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
  amount: number; // GHS
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

  const inp = "w-full bg-white/5 border border-white/10 text-white text-xs px-4 py-4 placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-colors";

  // ── Card: open Paystack secure popup ─────────────────────────
  const openCardPopup = () => {
    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) { onError("Payment system not loaded. Please refresh."); return; }
    const handler = PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amount * 100), // pesewas
      currency: "GHS",
      channels: ["card"], // card only — MoMo stays embedded
      ref: `MV-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      callback: (response: { reference: string }) => {
        onCardSuccess(response.reference);
      },
      onClose: () => {},
    });
    handler.openIframe();
  };

  // ── MoMo: fully embedded API call ────────────────────────────
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

  // ── Method selector ──────────────────────────────────────────
  if (!method) {
    return (
      <>
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
          onLoad={() => setPaystackReady(true)}
        />
        <div className="space-y-3">
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-5">Choose Payment Method</p>
          {[
            { id: "card" as Method,         icon: "💳", label: "Debit / Credit Card",  sub: "Visa, Mastercard, Verve — secure Paystack vault" },
            { id: "mobile_money" as Method, icon: "📱", label: "Mobile Money",          sub: "MTN, Telecel, AirtelTigo — prompt sent to your phone" },
          ].map(m => (
            <button key={m.id!} onClick={() => setMethod(m.id)}
              className="w-full flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] p-4 transition-all text-left group">
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white/80">{m.label}</p>
                <p className="text-[9px] text-white/25 mt-0.5">{m.sub}</p>
              </div>
              <span className="text-white/20 group-hover:text-white/50 transition-colors">→</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  // ── Card: launch Paystack popup ──────────────────────────────
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
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/30">Card Payment</p>
            <button onClick={() => setMethod(null)} className="text-[9px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors">← Back</button>
          </div>
          {/* Security notice */}
          <div className="bg-green-500/5 border border-green-500/15 p-4 flex gap-3 items-start">
            <span className="text-green-400 text-sm mt-0.5">🔒</span>
            <div>
              <p className="text-[9px] text-green-400/70 font-semibold tracking-widest uppercase mb-1">Secure Card Payment</p>
              <p className="text-[9px] text-white/30 leading-relaxed">
                Your card details are entered directly in Paystack&apos;s encrypted vault. We never see or store your card number.
              </p>
            </div>
          </div>
          <button
            onClick={openCardPopup}
            disabled={!paystackReady}
            className="w-full bg-white text-black text-xs font-bold tracking-[0.25em] uppercase py-5 hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {paystackReady ? `Pay GHS ${amount} Securely →` : "Loading secure payment…"}
          </button>
        </div>
      </>
    );
  }

  // ── MoMo: awaiting screen ────────────────────────────────────
  if (momoStage === "awaiting") {
    return (
      <div className="text-center py-4">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-30" />
          <div className="relative w-16 h-16 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center text-xl">📱</div>
        </div>
        <p className="text-xs text-white/50 mb-1">MoMo prompt sent to</p>
        <p className="text-sm font-mono font-bold text-white/80 mb-4">{momo.phone}</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          <span className="text-[10px] text-white/25 ml-2 tracking-widest uppercase">Waiting for approval</span>
        </div>
        <p className="text-[10px] text-white/20">Enter your MoMo PIN on your phone. Do not close this page.</p>
      </div>
    );
  }

  // ── MoMo: entry form ─────────────────────────────────────────
  return (
    <form onSubmit={submitMomo} className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] tracking-[0.3em] uppercase text-white/30">Mobile Money</p>
        <button type="button" onClick={() => setMethod(null)} className="text-[9px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors">← Back</button>
      </div>
      <select value={momo.provider} onChange={e => setMomo(m => ({ ...m, provider: e.target.value }))}
        className={inp + " cursor-pointer"}>
        {PROVIDERS.map(p => <option key={p.value} value={p.value} className="bg-[#111]">{p.label}</option>)}
      </select>
      <input required type="tel" placeholder="Mobile Money Number (e.g. 0241234567)"
        value={momo.phone} onChange={e => setMomo(m => ({ ...m, phone: e.target.value }))}
        className={inp} />
      <p className="text-[10px] text-white/25 leading-relaxed">
        A <strong className="text-white/40">GHS {amount}</strong> prompt will be sent to this number. Approve with your MoMo PIN.
      </p>
      <button type="submit" disabled={busy}
        className="w-full bg-white text-black text-xs font-bold tracking-[0.25em] uppercase py-5 hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 mt-2">
        {busy
          ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Sending Prompt…</>
          : `Send GHS ${amount} MoMo Prompt`}
      </button>
    </form>
  );
}
