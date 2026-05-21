"use client";

import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [store, setStore] = useState({
    storeName: "",
    tagline: "",
    email: "",
    currency: "GHS",
    timezone: "",
    maintenanceMode: false,
    storeOpen: true,
  });

  const [shipping, setShipping] = useState({
    freeShippingThreshold: "",
    defaultCarrier: "UPS",
    internationalEnabled: false,
    flatRate: "",
    taxRate: "",
  });

  // Load from mock DB (localStorage) on mount
  useEffect(() => {
    const savedConf = localStorage.getItem("monvre_config");
    if (savedConf) {
      try {
        const conf = JSON.parse(savedConf);
        if (conf.store) setStore(conf.store);
        if (conf.shipping) setShipping(conf.shipping);
        if (conf.notifications) setNotifications(conf.notifications);
      } catch (e) {}
    }
  }, []);

  const [notifications, setNotifications] = useState({
    orderEmails: true,
    supportEmails: true,
    lowStockAlerts: true,
    lowStockThreshold: "",
  });

  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState<string | null>(null);

  const saveSection = (label: string) => {
    // Save to mock DB (localStorage)
    const currentConf = localStorage.getItem("monvre_config");
    let conf = currentConf ? JSON.parse(currentConf) : {};
    
    if (label === "Store Settings") conf.store = store;
    if (label === "Shipping & Tax") conf.shipping = shipping;
    if (label === "Notifications") conf.notifications = notifications;
    
    localStorage.setItem("monvre_config", JSON.stringify(conf));
    
    setSaved(label);
    setTimeout(() => setSaved(null), 2500);
  };

  const Section = ({ title, children, onSave }: { title: string; children: React.ReactNode; onSave: () => void }) => (
    <div className="bg-white/[0.03] border border-white/5 rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-[9px] tracking-[0.3em] uppercase text-white/40">{title}</p>
      </div>
      <div className="px-6 py-6 space-y-5">
        {children}
        <div className="pt-2 flex items-center gap-4">
          <button
            onClick={onSave}
            className="bg-white text-black text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-white/90 transition-colors"
          >
            Save Changes
          </button>
          {saved === title && (
            <span className="text-green-400 text-[10px] tracking-widest uppercase">Saved ✓</span>
          )}
        </div>
      </div>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="grid md:grid-cols-[200px_1fr] gap-3 items-center">
      <label className="text-xs text-white/40">{label}</label>
      {children}
    </div>
  );

  const inputCls = "bg-white/5 border border-white/10 text-white text-xs px-4 py-3 focus:outline-none focus:border-white/25 transition-colors w-full";

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-white/90 uppercase">Settings</h1>
        <p className="text-xs text-white/30 mt-0.5">Manage your store configuration</p>
      </div>

      {/* Store Settings */}
      <Section title="Store Settings" onSave={() => saveSection("Store Settings")}>
        <Field label="Store Name">
          <input className={inputCls} value={store.storeName}
            onChange={e => setStore(p => ({ ...p, storeName: e.target.value }))} />
        </Field>
        <Field label="Tagline">
          <input className={inputCls} value={store.tagline}
            onChange={e => setStore(p => ({ ...p, tagline: e.target.value }))} />
        </Field>
        <Field label="Support Email">
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
              {["GHS", "USD", "EUR", "GBP", "CAD", "AUD"].map(c => (
                <option key={c} value={c} className="bg-[#111]">{c}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/30">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </Field>
        <Field label="Store Open">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStore(p => ({ ...p, storeOpen: !p.storeOpen }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${store.storeOpen ? "bg-green-500" : "bg-white/15"}`}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: store.storeOpen ? "translateX(20px)" : "translateX(2px)" }}
              />
            </button>
            <span className="text-xs text-white/40">{store.storeOpen ? "Open for orders" : "Closed"}</span>
          </div>
        </Field>
        <Field label="Maintenance Mode">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStore(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${store.maintenanceMode ? "bg-amber-500" : "bg-white/15"}`}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: store.maintenanceMode ? "translateX(20px)" : "translateX(2px)" }}
              />
            </button>
            <span className="text-xs text-white/40">{store.maintenanceMode ? "Maintenance ON" : "Off"}</span>
          </div>
        </Field>
      </Section>
 
      {/* Shipping & Tax */}
      <Section title="Shipping & Tax" onSave={() => saveSection("Shipping & Tax")}>
        <Field label="Flat Shipping Rate ($)">
          <input className={inputCls} type="number" step="0.01" value={shipping.flatRate}
            onChange={e => setShipping(p => ({ ...p, flatRate: e.target.value }))} />
        </Field>
        <Field label="Tax Rate (%)">
          <input className={inputCls} type="number" step="0.1" value={shipping.taxRate}
            onChange={e => setShipping(p => ({ ...p, taxRate: e.target.value }))} />
        </Field>
        <div className="border-t border-white/5 my-4 pt-4"></div>
        <Field label="Free Shipping Over ($)">
          <input className={inputCls} type="number" value={shipping.freeShippingThreshold}
            onChange={e => setShipping(p => ({ ...p, freeShippingThreshold: e.target.value }))} />
        </Field>
        <Field label="Default Carrier">
          <div className="relative w-full">
            <select
              className={inputCls + " appearance-none cursor-pointer pr-10"}
              value={shipping.defaultCarrier}
              onChange={e => setShipping(p => ({ ...p, defaultCarrier: e.target.value }))}
            >
              {["UPS", "USPS", "DHL", "FedEx"].map(c => (
                <option key={c} value={c} className="bg-[#111]">{c}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/30">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </Field>
        <Field label="International Shipping">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShipping(p => ({ ...p, internationalEnabled: !p.internationalEnabled }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${shipping.internationalEnabled ? "bg-green-500" : "bg-white/15"}`}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: shipping.internationalEnabled ? "translateX(20px)" : "translateX(2px)" }}
              />
            </button>
            <span className="text-xs text-white/40">{shipping.internationalEnabled ? "Enabled" : "Disabled"}</span>
          </div>
        </Field>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" onSave={() => saveSection("Notifications")}>
        {[
          { key: "orderEmails", label: "New order emails" },
          { key: "supportEmails", label: "Support ticket emails" },
          { key: "lowStockAlerts", label: "Low stock alerts" },
        ].map(({ key, label }) => (
          <Field key={key} label={label}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNotifications(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${notifications[key as keyof typeof notifications] ? "bg-green-500" : "bg-white/15"}`}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ transform: notifications[key as keyof typeof notifications] ? "translateX(20px)" : "translateX(2px)" }}
                />
              </button>
              <span className="text-xs text-white/40">{notifications[key as keyof typeof notifications] ? "On" : "Off"}</span>
            </div>
          </Field>
        ))}
        <Field label="Low Stock Threshold">
          <input className={inputCls} type="number" value={notifications.lowStockThreshold}
            onChange={e => setNotifications(p => ({ ...p, lowStockThreshold: e.target.value }))} />
        </Field>
      </Section>

      {/* Change Password */}
      <Section title="Admin Password" onSave={() => saveSection("Admin Password")}>
        {[
          { key: "current", label: "Current Password", placeholder: "Current password" },
          { key: "next", label: "New Password", placeholder: "New password (min 8 chars)" },
          { key: "confirm", label: "Confirm Password", placeholder: "Confirm new password" },
        ].map(f => (
          <Field key={f.key} label={f.label}>
            <input
              className={inputCls}
              type="password"
              autoComplete="new-password"
              placeholder={f.placeholder}
              value={password[f.key as keyof typeof password]}
              onChange={e => setPassword(p => ({ ...p, [f.key]: e.target.value }))}
            />
          </Field>
        ))}
      </Section>
    </div>
  );
}
