"use client";

import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [payment, setPayment] = useState({
    cashapp_tag: "$AJsKitchen",
    zelle_email: "",
    zelle_phone: "",
    payment_ref: "AJSKITCHEN",
  });
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState("");

  const [store, setStore] = useState({
    storeName: "AJ KITCHEN",
    tagline: "Authentic Ghanaian Feast",
    email: "support@winningedgeinvestment.com",
    currency: "USD",
    timezone: "America/New_York",
    maintenanceMode: false,
    storeOpen: true,
  });

  const [shipping, setShipping] = useState({
    freeShippingThreshold: "100",
    defaultCarrier: "Private Driver",
    internationalEnabled: false,
    flatRate: "10",
    taxRate: "0",
  });

  const [notifications, setNotifications] = useState({
    orderEmails: true,
    supportEmails: true,
    lowStockAlerts: false,
    lowStockThreshold: "0",
  });

  useEffect(() => {
    // Load all settings from DB
    fetch("/api/admin/payment-settings")
      .then(r => r.json())
      .then(data => {
        if (data.cashapp_tag !== undefined) {
          setPayment(p => ({
            ...p,
            cashapp_tag: data.cashapp_tag ?? p.cashapp_tag,
            zelle_email: data.zelle_email ?? p.zelle_email,
            zelle_phone: data.zelle_phone ?? p.zelle_phone,
            payment_ref: data.payment_ref ?? p.payment_ref,
          }));
        }
        setStore(s => ({
          ...s,
          storeName: data.store_name ?? s.storeName,
          tagline: data.store_tagline ?? s.tagline,
          email: data.store_email ?? s.email,
          currency: data.store_currency ?? s.currency,
          timezone: data.store_timezone ?? s.timezone,
          storeOpen: data.store_open === undefined ? true : data.store_open === "true",
        }));
        setNotifications(n => ({
          ...n,
          orderEmails: data.notify_order === undefined ? true : data.notify_order === "true",
        }));
      })
      .catch(() => {});
  }, []);

  const [saved, setSaved] = useState<string | null>(null);

  const savePaymentSettings = async () => {
    setPaymentSaving(true);
    setPaymentMsg("");
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });
      if (res.ok) { setPaymentMsg("✓ Saved"); setTimeout(() => setPaymentMsg(""), 2500); }
      else setPaymentMsg("Failed to save. Try again.");
    } catch { setPaymentMsg("Failed to save. Try again."); }
    setPaymentSaving(false);
  };

  const saveSection = async (label: string) => {
    try {
      let payload = {};
      if (label === "Kitchen Settings") {
        payload = {
          store_name: store.storeName,
          store_tagline: store.tagline,
          store_email: store.email,
          store_currency: store.currency,
          store_timezone: store.timezone,
          store_open: store.storeOpen ? "true" : "false",
        };
      } else if (label === "Notifications") {
        payload = {
          notify_order: notifications.orderEmails ? "true" : "false",
        };
      }

      const res = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaved(label);
        setTimeout(() => setSaved(null), 2500);
      }
    } catch (e) {
      console.error("Save section failed:", e);
    }
  };

  const Section = ({ title, children, onSave }: { title: string; children: React.ReactNode; onSave: () => void }) => (
    <div className="bg-white border border-pink-100 rounded-sm overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-pink-50 bg-pink-50/20">
        <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 font-black">{title}</p>
      </div>
      <div className="px-6 py-8 space-y-6">
        {children}
        <div className="pt-4 flex items-center gap-4">
          <button
            onClick={onSave}
            className="bg-pink-500 text-white text-[10px] font-black tracking-widest uppercase px-8 py-3 hover:bg-pink-600 transition-all rounded-sm shadow-md"
          >
            Save {title}
          </button>
          {saved === title && (
            <span className="text-green-600 text-[10px] font-black tracking-widest uppercase animate-fadeIn">Updated Successfully ✓</span>
          )}
        </div>
      </div>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="grid md:grid-cols-[200px_1fr] gap-4 items-center">
      <label className="text-[10px] font-black text-pink-300 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );

  const inputCls = "bg-pink-50/30 border border-pink-100 text-pink-700 text-xs px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors w-full font-bold rounded-sm";

  return (
    <div className="space-y-8 max-w-3xl bg-white p-2">
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-pink-600 uppercase">Kitchen Settings</h1>
        <p className="text-xs text-pink-300 mt-1 tracking-wide font-bold">Manage your kitchen configuration and business rules</p>
      </div>

      {/* ── PAYMENT DETAILS ─────────────────────────────── */}
      <div className="bg-white border border-pink-100 rounded-sm overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-pink-50 bg-pink-50/20">
          <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 font-black">💳 Payment Details</p>
        </div>
        <div className="px-6 py-8 space-y-6">
          <p className="text-[10px] text-pink-300 font-bold -mt-2">These details are shown to customers during checkout.</p>
          <Field label="CashApp Tag">
            <input className={inputCls} value={payment.cashapp_tag} placeholder="e.g. $AJsKitchen"
              onChange={e => setPayment(p => ({ ...p, cashapp_tag: e.target.value }))} />
          </Field>
          <Field label="Zelle Phone">
            <input className={inputCls} value={payment.zelle_phone} placeholder="e.g. +1 614-000-0000"
              onChange={e => setPayment(p => ({ ...p, zelle_phone: e.target.value }))} />
          </Field>
          <Field label="Zelle Email">
            <input className={inputCls} type="email" value={payment.zelle_email} placeholder="e.g. pay@ajkitchen.com"
              onChange={e => setPayment(p => ({ ...p, zelle_email: e.target.value }))} />
          </Field>
          <Field label="Payment Reference">
            <input className={inputCls} value={payment.payment_ref} placeholder="e.g. AJSKITCHEN"
              onChange={e => setPayment(p => ({ ...p, payment_ref: e.target.value }))} />
          </Field>
          <div className="pt-4 flex items-center gap-4">
            <button onClick={savePaymentSettings} disabled={paymentSaving}
              className="bg-pink-500 text-white text-[10px] font-black tracking-widest uppercase px-8 py-3 hover:bg-pink-600 transition-all rounded-sm shadow-md disabled:opacity-50 flex items-center gap-2">
              {paymentSaving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save Payment Details
            </button>
            {paymentMsg && (
              <span className={`text-[10px] font-black tracking-widest uppercase ${paymentMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
                {paymentMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      <Section title="Kitchen Settings" onSave={() => saveSection("Kitchen Settings")}>
        <Field label="Kitchen Name">
          <input className={inputCls} value={store.storeName}
            onChange={e => setStore(p => ({ ...p, storeName: e.target.value }))} />
        </Field>
        <Field label="Tagline">
          <input className={inputCls} value={store.tagline}
            onChange={e => setStore(p => ({ ...p, tagline: e.target.value }))} />
        </Field>
        <Field label="Kitchen Email">
          <input className={inputCls} type="email" value={store.email}
            onChange={e => setStore(p => ({ ...p, email: e.target.value }))} />
        </Field>
        <Field label="Currency">
          <div className="relative w-full">
            <select
              className={inputCls + " appearance-none cursor-pointer pr-10"}
              value={store.currency}
              onChange={e => setStore(p => ({ ...p, currency: e.target.value }))}
            >
              {["USD", "GHS"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-pink-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </Field>
        <Field label="Kitchen Open">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStore(p => ({ ...p, storeOpen: !p.storeOpen }))}
              className={`w-12 h-6 rounded-full transition-all relative ${store.storeOpen ? "bg-green-500 shadow-inner" : "bg-pink-100"}`}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                style={{ transform: store.storeOpen ? "translateX(24px)" : "translateX(4px)" }}
              />
            </button>
            <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">{store.storeOpen ? "Accepting Orders" : "Kitchen Closed"}</span>
          </div>
        </Field>
      </Section>

      <Section title="Notifications" onSave={() => saveSection("Notifications")}>
        <Field label="Order Alerts">
          <label className="flex items-center gap-3 cursor-pointer group">
             <input type="checkbox" checked={notifications.orderEmails}
               onChange={e => setNotifications(p => ({ ...p, orderEmails: e.target.checked }))}
               className="w-4 h-4 rounded border-pink-200 text-pink-600 focus:ring-pink-500" />
             <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Email kitchen on new order</span>
          </label>
        </Field>
      </Section>
    </div>
  );
}
