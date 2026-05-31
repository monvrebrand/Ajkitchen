"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import AddressAutocomplete from "@/components/AddressAutocomplete";

type Stage = "shipping" | "payment" | "processing" | "success";
type PayMethod = "cashapp" | "zelle";

interface PaySettings {
  cashapp_tag: string;
  zelle_email: string;
  zelle_phone: string;
  payment_ref: string;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [stage, setStage]       = useState<Stage>("shipping");
  const [orderNum, setOrderNum] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const grand = +totalPrice.toFixed(2);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
  });

  /* payment state */
  const [payMethod, setPayMethod]   = useState<PayMethod>("cashapp");
  const [paySettings, setPaySettings] = useState<PaySettings>({
    cashapp_tag: "$AJsKitchen",
    zelle_email: "",
    zelle_phone: "",
    payment_ref: "AJSKITCHEN",
  });
  const [screenshot, setScreenshot]   = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploading, setUploading]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* prefill from session */
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(({ user: u }) => {
      if (!u) return;
      const parts = (u.full_name || "").trim().split(" ");
      setForm(f => ({
        ...f,
        email:     u.email      || f.email,
        firstName: parts[0]     || f.firstName,
        lastName:  parts.slice(1).join(" ") || f.lastName,
        phone:     u.phone      || f.phone,
        address:   u.address    || f.address,
        city:      u.city       || f.city,
        state:     u.state      || f.state,
        zip:       u.zip        || f.zip,
      }));
    }).catch(() => {});
  }, []);

  const [storeOpen, setStoreOpen] = useState(true);

  /* fetch payment settings from public endpoint */
  useEffect(() => {
    fetch("/api/payment-settings")
      .then(r => r.json())
      .then(data => {
        if (data) {
          if (data.cashapp_tag !== undefined) setPaySettings(data);
          if (data.store_open !== undefined) setStoreOpen(data.store_open === "true");
        }
      })
      .catch(() => {});
  }, []);

  const [formError, setFormError] = useState("");

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!storeOpen) {
      return setFormError("AJ KITCHEN is currently closed and not accepting new orders.");
    }
    if (!form.firstName.trim() || !form.lastName.trim())
      return setFormError("Please enter your full name.");
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      return setFormError("Please enter a valid email address.");
    if (!form.phone.trim())
      return setFormError("Please enter your phone number.");
    if (!form.address.trim())
      return setFormError("Please enter your street address.");
    if (!form.city.trim())
      return setFormError("Please enter your city.");
    if (!form.state.trim())
      return setFormError("Please enter your state.");
    setStage("payment");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setScreenshot(f);
    setScreenshotPreview(URL.createObjectURL(f));
  };

  const handleSubmitOrder = async () => {
    if (!screenshot) { setErrorMsg("Please upload a screenshot of your payment."); return; }
    setUploading(true);
    setErrorMsg("");

    try {
      /* 1. upload screenshot */
      const fd = new FormData();
      fd.append("screenshot", screenshot);
      const upRes  = await fetch("/api/payment/upload-screenshot", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok || upData.error) throw new Error(upData.error || "Upload failed");

      /* 2. create order */
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderData: {
            firstName: form.firstName, lastName: form.lastName,
            email: form.email, phone: form.phone,
            address: form.address, city: form.city, state: form.state, zip: form.zip,
            items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.quantity, size: i.size, image: i.image, note: i.note || "" })),
            note: items.filter(i => i.note).map(i => `${i.name}: ${i.note}`).join(" | "),
            subtotal: totalPrice, shippingFee: 0, tax: 0, total: grand,
            paymentMethod: payMethod,
            paymentScreenshot: upData.url,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Order failed");

      setOrderNum(data.orderId);
      setPaidAmount(grand);
      clearCart();
      // Save address back to user profile for next time
      fetch("/api/auth/update-address", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: form.address, city: form.city, state: form.state, zip: form.zip }),
      }).catch(() => {});
      setStage("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const inputCls = "w-full bg-white border border-pink-100 text-pink-700 text-xs px-4 py-4 placeholder:text-pink-200 focus:outline-none focus:border-pink-500 transition-colors font-bold rounded-sm";

  if (items.length === 0 && stage !== "success") return (
    <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-6 px-5 pt-20">
      <p className="text-pink-300 tracking-widest uppercase text-sm font-black">Your bag is empty</p>
      <Link href="/store" className="bg-pink-500 text-white text-xs font-black tracking-widest uppercase px-10 py-4 rounded-sm shadow-md">See Menu</Link>
    </div>
  );

  const Summary = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? "bg-pink-50/20 border border-pink-100 p-5 mb-8 rounded-sm" : "bg-pink-50/20 border border-pink-100 p-8 sticky top-28 rounded-sm shadow-sm"}>
      <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 mb-4 font-black">Order Summary</p>
      <div className="space-y-4 mb-6">
        {items.map(item => (
          <div key={`${item.id}-${item.size}`} className="flex gap-3">
            <div className={`relative ${compact ? "w-12 h-12" : "w-14 h-14"} bg-pink-100 flex-shrink-0 rounded-sm overflow-hidden border border-pink-100`}>
              <Image src={item.image} alt={item.name} fill className="object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-pink-700 truncate uppercase tracking-tight">{item.name}</p>
              <p className="text-[10px] text-pink-400 font-bold uppercase">{item.size} × {item.quantity}</p>
              {item.note && <p className="text-[9px] text-amber-600 font-bold mt-0.5 truncate">📝 {item.note}</p>}
            </div>
            <p className="text-xs text-pink-500 font-black flex-shrink-0">$ {(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-pink-100 pt-4 space-y-2 text-xs">
        <div className="flex justify-between text-pink-400 font-bold uppercase tracking-tighter"><span>Subtotal</span><span>$ {grand}</span></div>
        <div className="flex justify-between text-pink-500 font-black uppercase tracking-tighter">
          <span>Delivery</span><span className="italic">Weekend Drop</span>
        </div>
        <div className="flex justify-between font-black text-pink-700 border-t border-pink-100 pt-3 text-lg">
          <span>Total</span><span>$ {grand}</span>
        </div>
      </div>
    </div>
  );

  const Steps = ({ current }: { current: 1 | 2 }) => (
    <div className="flex items-center gap-3 mb-10">
      {[{ n: 1, label: "Delivery" }, { n: 2, label: "Payment" }].map(({ n, label }, i) => (
        <div key={n} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${current === n ? "bg-pink-500 text-white" : current > n ? "bg-green-500 text-white" : "bg-pink-100 text-pink-300"}`}>
              {current > n ? "✓" : n}
            </div>
            <span className={`text-[9px] tracking-widest uppercase font-black ${current === n ? "text-pink-600" : current > n ? "text-green-600" : "text-pink-200"}`}>{label}</span>
          </div>
          {i === 0 && <div className={`h-0.5 w-12 ${current > 1 ? "bg-green-200" : "bg-pink-100"}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-pink-600 mb-8 md:mb-12">Checkout</h1>
        <AnimatePresence mode="wait">

          {/* ── STEP 1 : DELIVERY ─────────────────────────── */}
          {stage === "shipping" && (
            <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-[1fr_380px] gap-8 md:gap-12">
              <div>
                <Steps current={1} />
                <div className="lg:hidden"><Summary compact /></div>
                <form onSubmit={handleContinue} className="space-y-4">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 mb-4 font-black">Delivery Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input name="firstName" placeholder="First Name" required value={form.firstName} onChange={handleChange} className={inputCls} />
                    <input name="lastName"  placeholder="Last Name"  required value={form.lastName}  onChange={handleChange} className={inputCls} />
                  </div>
                  <input name="email" type="email" placeholder="Email Address" required value={form.email} onChange={handleChange} className={inputCls} />
                  <input name="phone" type="tel"   placeholder="Phone Number (for delivery updates)" required value={form.phone} onChange={handleChange} className={inputCls} />
                  <AddressAutocomplete
                    value={form.address}
                    onChange={val => setForm(f => ({ ...f, address: val }))}
                    onSelect={({ address, city, state, zip }) =>
                      setForm(f => ({ ...f, address: address || f.address, city: city || f.city, state: state || f.state, zip: zip || f.zip }))
                    }
                    placeholder="Street address (e.g. 12 South Walnut Street)"
                    className={inputCls}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input name="city"  placeholder="City"     required value={form.city}  onChange={handleChange} className={inputCls} />
                    <input name="state" placeholder="State"    required value={form.state} onChange={handleChange} className={inputCls} />
                    <input name="zip"   placeholder="ZIP Code" value={form.zip}   onChange={handleChange} className={inputCls} />
                  </div>
                  {formError && (
                    <p className="text-red-500 text-xs border border-red-100 bg-red-50 px-4 py-3 font-bold rounded-sm">{formError}</p>
                  )}
                  <button type="submit" disabled={!storeOpen} className="w-full bg-pink-500 text-white text-xs font-black tracking-[0.25em] uppercase py-5 hover:bg-pink-600 transition-colors mt-2 rounded-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {storeOpen ? "Continue to Payment →" : "Kitchen is Closed 🚧"}
                  </button>
                </form>
              </div>
              <div className="hidden lg:block"><Summary /></div>
            </motion.div>
          )}

          {/* ── STEP 2 : PAYMENT (CashApp / Zelle) ────────── */}
          {stage === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-[1fr_380px] gap-8 md:gap-12">
              <div>
                <Steps current={2} />
                <div className="lg:hidden mb-6"><Summary compact /></div>

                {/* delivery summary strip */}
                <div className="bg-pink-50/30 border border-pink-100 p-4 mb-6 flex items-start justify-between gap-4 rounded-sm">
                  <div>
                    <p className="text-[9px] tracking-widest uppercase text-pink-300 mb-1 font-black">Delivering to</p>
                    <p className="text-xs text-pink-700 font-bold">{form.firstName} {form.lastName} · {form.email}</p>
                    <p className="text-xs text-pink-400 font-medium">{form.address}, {form.city}{form.state ? `, ${form.state}` : ""} {form.zip}</p>
                  </div>
                  <button onClick={() => setStage("shipping")} className="text-[9px] tracking-widest uppercase text-pink-400 hover:text-pink-600 transition-colors flex-shrink-0 font-black">Edit</button>
                </div>

                {/* method selector */}
                <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 mb-3 font-black">Choose Payment Method</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                {/* CashApp */}
                <button onClick={() => setPayMethod("cashapp")}
                  className={`flex flex-col items-center gap-2 py-5 border-2 rounded-sm transition-all font-black text-xs tracking-widest uppercase ${
                    payMethod === "cashapp" ? "border-[#00D632] bg-green-50 text-green-700 shadow-md" : "border-pink-100 text-pink-300 hover:border-green-200"
                  }`}>
                  <svg width="38" height="38" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#00D632">
                    <path d="M23.59 3.475a5.1 5.1 0 00-3.05-3.05c-1.31-.42-2.5-.42-4.92-.42H8.36c-2.4 0-3.61 0-4.9.4a5.1 5.1 0 00-3.05 3.06C0 4.765 0 5.965 0 8.365v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 003.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 003.06-3.06c.41-1.3.41-2.5.41-4.9v-7.25c0-2.41 0-3.61-.41-4.91zm-6.17 4.63l-.93.93a.5.5 0 01-.67.01 5 5 0 00-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 01-.48.39H9.63l-.09-.01a.5.5 0 01-.38-.59l.28-1.27a6.54 6.54 0 01-2.88-1.57v-.01a.48.48 0 010-.68l1-.97a.49.49 0 01.67 0c.91.86 2.13 1.34 3.39 1.32 1.3 0 2.17-.55 2.17-1.42 0-.87-.88-1.1-2.54-1.72-1.76-.63-3.43-1.52-3.43-3.6 0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 01.48-.38h1.78l.1.01c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68z"/>
                  </svg>
                  Cash App
                </button>

                {/* Zelle */}
                <button onClick={() => setPayMethod("zelle")}
                  className={`flex flex-col items-center gap-2 py-5 border-2 rounded-sm transition-all font-black text-xs tracking-widest uppercase ${
                    payMethod === "zelle" ? "border-[#6D1ED4] bg-purple-50 text-purple-700 shadow-md" : "border-pink-100 text-pink-300 hover:border-purple-200"
                  }`}>
                  <svg width="38" height="38" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#6D1ED4">
                    <path d="M13.559 24h-2.841a.483.483 0 0 1-.483-.483v-2.765H5.638a.667.667 0 0 1-.666-.666v-2.234a.67.67 0 0 1 .142-.412l8.139-10.382h-7.25a.667.667 0 0 1-.667-.667V3.914c0-.367.299-.666.666-.666h4.23V.483c0-.266.217-.483.483-.483h2.841c.266 0 .483.217.483.483v2.765h4.323c.367 0 .666.299.666.666v2.137a.67.67 0 0 1-.141.41l-8.19 10.481h7.665c.367 0 .666.299.666.666v2.477a.667.667 0 0 1-.666.667h-4.32v2.765a.483.483 0 0 1-.483.483Z"/>
                  </svg>
                  Zelle
                </button>
                </div>

                {/* payment details box */}
                <div className="bg-gradient-to-br from-pink-50 to-white border-2 border-pink-100 rounded-md p-6 mb-6">
                  {payMethod === "cashapp" ? (
                    <>
                      <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 mb-1 font-black">Send $ {grand} to CashApp</p>
                      <p className="text-3xl font-black text-pink-600 mt-2 mb-1">{paySettings.cashapp_tag || "$AJsKitchen"}</p>
                      <p className="text-[10px] text-pink-300 font-bold uppercase tracking-widest">CashApp Tag</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 mb-1 font-black">Send $ {grand} via Zelle to</p>
                      {paySettings.zelle_phone && (
                        <p className="text-2xl font-black text-pink-600 mt-2 mb-0.5">{paySettings.zelle_phone}</p>
                      )}
                      {paySettings.zelle_email && (
                        <p className="text-lg font-bold text-pink-500 mb-1">{paySettings.zelle_email}</p>
                      )}
                      {!paySettings.zelle_phone && !paySettings.zelle_email && (
                        <p className="text-pink-300 text-sm font-bold mt-2">Zelle details coming soon</p>
                      )}
                    </>
                  )}
                  <div className="mt-4 pt-4 border-t border-pink-100">
                    <p className="text-[9px] tracking-widest uppercase text-pink-300 font-black mb-1">Add this reference / note in your payment</p>
                    <p className="text-lg font-black text-pink-600 tracking-wider">{paySettings.payment_ref || "AJSKITCHEN"}</p>
                  </div>
                </div>

                {/* screenshot upload */}
                <div className="mb-6">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 mb-3 font-black">Upload Payment Screenshot</p>

                  {screenshotPreview ? (
                    <div className="relative rounded-md overflow-hidden border-2 border-green-200 bg-green-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={screenshotPreview} alt="Payment screenshot" className="w-full max-h-60 object-contain" />
                      <button
                        onClick={() => { setScreenshot(null); setScreenshotPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                        className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-sm shadow"
                      >✕ Remove</button>
                      <p className="text-center text-[10px] text-green-700 font-black py-2 bg-green-50">Screenshot uploaded ✓</p>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-pink-200 rounded-md py-10 flex flex-col items-center gap-3 hover:border-pink-400 hover:bg-pink-50/30 transition-all group">
                      <span className="text-3xl">📸</span>
                      <p className="text-xs font-black text-pink-400 uppercase tracking-widest group-hover:text-pink-600 transition-colors">Click to upload screenshot</p>
                      <p className="text-[10px] text-pink-200 font-bold">JPG · PNG · WEBP · max 10MB</p>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>

                {errorMsg && (
                  <p className="text-red-500 text-xs border border-red-100 bg-red-50 px-4 py-3 mb-4 font-bold rounded-sm">{errorMsg}</p>
                )}

                <button
                  onClick={handleSubmitOrder}
                  disabled={uploading || !screenshot}
                  className="w-full bg-pink-500 text-white text-xs font-black tracking-[0.25em] uppercase py-5 hover:bg-pink-600 transition-colors disabled:opacity-50 rounded-sm shadow-lg flex items-center justify-center gap-3"
                >
                  {uploading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Confirming Order…</>
                  ) : "Confirm Order →"}
                </button>
                <p className="text-center text-[10px] text-pink-200 font-bold mt-3">
                  Your order will be reviewed and confirmed within 1 hour
                </p>
              </div>
              <div className="hidden lg:block"><Summary /></div>
            </motion.div>
          )}

          {/* ── SUCCESS ───────────────────────────────────── */}
          {stage === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center pt-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                className="w-16 h-16 rounded-full border border-green-200 bg-green-50 flex items-center justify-center mx-auto mb-6">
                <svg width="22" height="22" fill="none" stroke="#16a34a" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </motion.div>
              <p className="text-[9px] tracking-[0.35em] uppercase text-green-600 mb-3 font-black">Order Received</p>
              <h1 className="text-3xl font-black tracking-tighter text-pink-600 uppercase mb-3">Thank You!</h1>
              <p className="text-xs text-pink-300 mb-2 font-bold">Your order number</p>
              <p className="text-lg font-mono font-black text-pink-700 mb-6">{orderNum}</p>

              <div className="bg-amber-50 border border-amber-200 px-5 py-5 mb-4 text-left rounded-sm">
                <p className="text-[9px] tracking-widest uppercase text-amber-600 font-black mb-1.5">⏳ Pending Review</p>
                <p className="text-[11px] text-amber-800 leading-relaxed font-bold">
                  We received your payment screenshot and will confirm your order within <strong>1 hour</strong>. You&apos;ll get an email once confirmed.
                </p>
              </div>

              <div className="bg-pink-50 border border-pink-100 px-5 py-5 mb-8 text-left rounded-sm">
                <p className="text-[9px] tracking-widest uppercase text-pink-500 font-black mb-1.5">🚚 Weekend Delivery</p>
                <p className="text-[11px] text-pink-600 leading-relaxed font-bold">
                  We deliver every <strong>Saturday and Sunday</strong>. You will receive a text when our driver is nearby!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Link href={`/track-order?id=${orderNum}`} className="border-2 border-pink-100 text-xs tracking-widest uppercase px-8 py-4 text-pink-400 hover:text-pink-600 hover:bg-pink-50 transition-all text-center font-black rounded-sm">Track My Order</Link>
                <Link href="/store"   className="bg-pink-500 text-white text-xs font-black tracking-widest uppercase px-8 py-4 hover:bg-pink-600 transition-colors text-center rounded-sm shadow-md">Order More Food</Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
