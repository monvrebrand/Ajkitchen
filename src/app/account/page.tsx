"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Order = {
  id: string;
  status: string;
  created_at: string;
  total: number;
  shipping_fee?: number;
  currency: string;
  items: { name: string; qty: number; size: string; image: string }[];
  shipping_address: string;
  shipping_city: string;
  shipping_state?: string;
  shipping_zip?: string;
  tracking_number?: string;
};

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  created_at: string;
};

type UserMeta = {
  full_name: string;
  email: string;
  initials: string;
  memberSince: string;
  address: string;
};

const statusColor: Record<string, string> = {
  Delivered:          "bg-green-50 text-green-600 border-green-200",
  "On the Way":       "bg-blue-50 text-blue-600 border-blue-200",
  "Out for Delivery": "bg-cyan-50 text-cyan-600 border-cyan-200",
  Preparing:          "bg-amber-50 text-amber-600 border-amber-200",
  Processing:         "bg-pink-50 text-pink-600 border-pink-200",
  Pending:            "bg-pink-50/30 text-pink-300 border-pink-100",
  Cancelled:          "bg-red-50 text-red-600 border-red-200",
};

const TABS = ["Orders", "Profile", "Support"] as const;
type Tab = typeof TABS[number];

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "profile" ? "Profile" : "Orders";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab as Tab);
  const [user, setUser] = useState<UserMeta | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Profile edit state
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Password reset state
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: "", ok: true });

  // Support state
  const [supportForm, setSupportForm] = useState({ subject: "", message: "" });
  const [supportSending, setSupportSending] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSending(true);
    try {
      const res = await fetch("/api/account/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: supportForm.subject,
          message: supportForm.message,
        }),
      });
      if (res.ok) {
        const newTicket = await res.json();
        setTickets([newTicket, ...tickets]);
        setSupportSent(true);
        setSupportForm({ subject: "", message: "" });
        setTimeout(() => setSupportSent(false), 4000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSupportSending(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch('/api/auth/me');
      const { user: u } = await meRes.json();

      if (!u) { router.push('/auth/login'); return; }

      const name = u.full_name || u.email || 'Member';
      const parts = name.split(' ');
      const initials = parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

      const memberSince = new Date(u.created_at).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric'
      });

      const address = u.address || '';
      setUser({ full_name: name, email: u.email || '', initials, memberSince, address });
      setEditName(name);
      setEditAddress(address);

      const orderRes = await fetch('/api/account/orders');
      const orderData = await orderRes.json();
      setOrders(Array.isArray(orderData) ? orderData : []);

      const ticketRes = await fetch('/api/account/tickets');
      const ticketData = await ticketRes.json();
      setTickets(Array.isArray(ticketData) ? ticketData : []);

      setLoading(false);
    };
    init();
  }, [router]);

  const handleChangePassword = async () => {
    if (!pwForm.next || pwForm.next !== pwForm.confirm) {
      setPwMsg({ text: 'Passwords do not match.', ok: false }); return;
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ text: 'Password must be at least 8 characters.', ok: false }); return;
    }
    setPwSaving(true);
    const res = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    const data = await res.json();
    setPwSaving(false);
    if (!res.ok || data.error) {
      setPwMsg({ text: data.error || 'Failed to update password.', ok: false });
    } else {
      setPwMsg({ text: 'Password updated successfully.', ok: true });
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwMsg({ text: '', ok: true }), 4000);
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: editName.trim(), address: editAddress.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      setUser(u => u ? { ...u, full_name: editName.trim(), address: editAddress.trim() } : u);
      setSaveMsg('Profile updated.');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const totalSpent = orders.reduce((s, o) => s + Number(o.total), 0);

  const bg    = "bg-white";
  const bgCard= "bg-pink-50/20";
  const border= "border-pink-100";
  const txt   = "text-pink-600";
  const txt2  = "text-pink-400";
  const inp   = "bg-white border-pink-100 text-pink-700 placeholder:text-pink-200 focus:border-pink-500";
  const btn   = "bg-pink-500 text-white hover:bg-pink-600";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} pt-16 transition-colors duration-300`}>

      {/* ── Hero banner ─────────────────────────────────────── */}
      <div className={`relative ${bgCard} border-b ${border} overflow-hidden transition-colors duration-300`}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(#db2777 1px, transparent 1px), linear-gradient(90deg, #db2777 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl md:text-3xl font-black tracking-tighter">
                  {user?.initials}
                </span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white" />
            </div>

            {/* Name + badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className={`text-2xl md:text-3xl font-black tracking-tighter ${txt} uppercase truncate`}>
                  {user?.full_name}
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  <span className="text-[9px] tracking-[0.25em] uppercase text-pink-600 font-bold">AJ Member</span>
                </span>
              </div>
              <p className={`text-xs ${txt2} tracking-wide font-bold`}>{user?.email}</p>
              <p className={`text-[10px] ${txt2} tracking-widest uppercase mt-1 font-bold`}>Member since {user?.memberSince}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 sm:gap-8 flex-shrink-0 items-start">
              {[
                { label: "Orders",  value: orders.length.toString() },
                { label: "Spent",   value: `$ ${totalSpent.toFixed(0)}` },
              ].map(s => (
                <div key={s.label} className="text-right">
                  <p className={`text-xl md:text-2xl font-black tracking-tighter ${txt}`}>{s.value}</p>
                  <p className={`text-[9px] tracking-[0.3em] uppercase ${txt2} font-bold`}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0 mt-8 border-b border-pink-100">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 text-[10px] tracking-[0.25em] uppercase transition-colors font-black ${
                  activeTab === tab ? "text-pink-600" : "text-pink-300 hover:text-pink-500"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="account-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <AnimatePresence mode="wait">

          {/* ── ORDERS TAB ──────────────────────────────────── */}
          {activeTab === "Orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {orders.length === 0 ? (
                <div className="text-center py-24 border border-pink-100 bg-pink-50/10 rounded-sm">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-pink-300 mb-4 font-black">No Orders Yet</p>
                  <p className="text-pink-400 text-sm mb-8 font-medium">Your delicious meal history will appear here</p>
                  <Link href="/store"
                    className="inline-block bg-pink-500 text-white text-xs font-black tracking-[0.25em] uppercase px-10 py-4 hover:bg-pink-600 transition-colors rounded-sm shadow-md">
                    Order Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border border-pink-50 bg-white hover:border-pink-200 hover:bg-pink-50/10 transition-all cursor-pointer rounded-sm shadow-sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <p className="text-sm font-mono font-black text-pink-700">{order.id}</p>
                            <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 border rounded-sm ${statusColor[order.status] || "bg-pink-50 text-pink-300 border-pink-100"}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-pink-400 font-bold">
                            {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          <p className="text-[10px] text-pink-300 mt-0.5 font-medium uppercase tracking-widest">
                            {order.items?.length || 0} item(s) · {order.shipping_city}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-black tracking-tight text-pink-600">
                            $ {Number(order.total).toFixed(2)}
                          </p>
                          <p className="text-[9px] text-pink-400 tracking-widest uppercase mt-1 font-black">Details →</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── PROFILE TAB ─────────────────────────────────── */}
          {activeTab === "Profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="space-y-6 max-w-xl mx-auto">
              {/* Member card */}
              <div className="relative overflow-hidden border border-pink-200 bg-gradient-to-br from-pink-50 to-white p-6 rounded-sm shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10"
                  style={{ background: "radial-gradient(circle, #db2777 0%, transparent 70%)" }} />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] tracking-[0.3em] uppercase text-pink-400 font-black">Membership Status</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                    <span className="text-[9px] tracking-widest uppercase text-pink-600 font-black">Active</span>
                  </span>
                </div>
                <p className="text-xl font-black tracking-tighter text-pink-600 uppercase mb-1">AJ Loyal Member</p>
                <p className="text-[10px] text-pink-400 leading-relaxed font-bold">Access to weekend specials and exclusive kitchen updates.</p>
                <div className="mt-4 pt-4 border-t border-pink-100 flex gap-6">
                  <div><p className="text-sm font-black text-pink-700">{orders.length}</p><p className="text-[9px] text-pink-300 tracking-widest uppercase font-bold">Orders</p></div>
                  <div><p className="text-sm font-black text-pink-700">$ {totalSpent.toFixed(0)}</p><p className="text-[9px] text-pink-300 tracking-widest uppercase font-bold">Spent</p></div>
                  <div><p className="text-sm font-black text-pink-700">{user?.memberSince}</p><p className="text-[9px] text-pink-300 tracking-widest uppercase font-bold">Since</p></div>
                </div>
              </div>

              {/* Edit profile */}
              <div className={`border ${border} ${bgCard} p-6 space-y-5 transition-colors duration-300 rounded-sm`}>
                <p className={`text-[9px] tracking-[0.3em] uppercase ${txt2} font-black`}>Personal Info</p>

                <div>
                  <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2 font-bold`}>Full Name</label>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className={`w-full border text-sm px-4 py-3.5 focus:outline-none transition-colors font-bold rounded-sm ${inp}`}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2 font-bold`}>Delivery Address</label>
                  <input
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    className={`w-full border text-sm px-4 py-3.5 focus:outline-none transition-colors font-bold rounded-sm ${inp}`}
                    placeholder="Street address, Columbus, OH"
                  />
                </div>

                <div>
                  <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2 font-bold`}>Email Address</label>
                  <input
                    value={user?.email || ""}
                    disabled
                    className={`w-full border text-sm px-4 py-3.5 cursor-not-allowed opacity-50 font-bold rounded-sm ${inp}`}
                  />
                  <p className={`text-[9px] ${txt2} mt-1.5 font-bold`}>Email cannot be changed directly.</p>
                </div>

                {saveMsg && (
                  <p className="text-green-600 text-xs flex items-center gap-2 font-bold">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {saveMsg}
                  </p>
                )}

                <button
                  onClick={handleSaveName}
                  disabled={saving || (editName === user?.full_name && editAddress === (user?.address ?? ""))}
                  className={`w-full text-xs font-black tracking-[0.25em] uppercase py-4 transition-colors disabled:opacity-40 flex items-center justify-center gap-3 rounded-sm shadow-md ${btn}`}
                >
                  {saving ? (
                    <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                  ) : "Save Profile"}
                </button>
              </div>

              {/* Password Reset */}
              <div className={`border ${border} ${bgCard} p-6 space-y-4 transition-colors duration-300 rounded-sm`}>
                <p className={`text-[9px] tracking-[0.3em] uppercase ${txt2} font-black`}>Security</p>
                {(["current","next","confirm"] as const).map((k, i) => (
                  <div key={k}>
                    <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2 font-bold`}>
                      {k === "current" ? "Current Password" : k === "next" ? "New Password" : "Confirm Password"}
                    </label>
                    <input
                      type="password"
                      value={pwForm[k]}
                      onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))}
                      placeholder="••••••••"
                      className={`w-full border text-sm px-4 py-3.5 focus:outline-none transition-colors font-mono tracking-widest rounded-sm ${inp}`}
                    />
                  </div>
                ))}
                {pwMsg.text && (
                  <p className={`text-xs flex items-center gap-2 font-bold ${pwMsg.ok ? "text-green-600" : "text-red-500"}`}>
                    {pwMsg.ok
                      ? <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      : <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>}
                    {pwMsg.text}
                  </p>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
                  className={`w-full text-xs font-black tracking-[0.25em] uppercase py-4 transition-colors disabled:opacity-40 flex items-center justify-center gap-3 rounded-sm shadow-md ${btn}`}
                >
                  {pwSaving ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</> : "Update Password"}
                </button>
              </div>

              {/* Account actions */}
              <div className={`border ${border} bg-white p-6 transition-colors duration-300 rounded-sm`}>
                <p className={`text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-5 font-black`}>Session</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/store"
                    className={`flex-1 border border-pink-100 text-xs tracking-widest uppercase px-6 py-3.5 text-pink-400 font-black hover:bg-pink-50 transition-all text-center rounded-sm`}>
                    Order Food
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex-1 border border-red-100 text-xs tracking-widest uppercase px-6 py-3.5 text-red-500 font-black hover:bg-red-50 transition-all rounded-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SUPPORT TAB ──────────────────────────────────── */}
          {activeTab === "Support" && (
            <motion.div key="support" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="max-w-xl mx-auto space-y-6">
              
              <div className="flex items-end justify-between border-b border-pink-100 pb-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-pink-600 uppercase">Support Center</h2>
                  <p className="text-xs text-pink-400 mt-1 font-bold">Ask about your weekend delivery.</p>
                </div>
                {!showNewTicketForm && (
                  <button 
                    onClick={() => setShowNewTicketForm(true)}
                    className="text-[9px] font-black tracking-widest uppercase border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white transition-all px-4 py-2 rounded-sm"
                  >
                    New Ticket
                  </button>
                )}
              </div>

              {/* New Ticket Form */}
              <AnimatePresence>
                {showNewTicketForm && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`border ${border} ${bgCard} p-6 sm:p-8 transition-colors duration-300 relative rounded-sm`}>
                      <button onClick={() => setShowNewTicketForm(false)} className="absolute top-4 right-4 text-pink-300 hover:text-pink-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      
                      <div className="mb-8">
                        <h2 className="text-lg font-black tracking-tight text-pink-600 uppercase">New Support Ticket</h2>
                        <p className="text-[10px] text-pink-400 mt-2 uppercase tracking-widest font-black">
                          Typical Response: 1-4 hours
                        </p>
                      </div>

                      <form onSubmit={handleSupportSubmit} className="space-y-4">
                        <div>
                          <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2 font-bold`}>Topic</label>
                          <div className="relative w-full">
                            <select
                              required
                              value={supportForm.subject}
                              onChange={e => setSupportForm(f => ({ ...f, subject: e.target.value }))}
                              className={`w-full border text-sm px-4 py-3.5 focus:outline-none transition-colors appearance-none cursor-pointer pr-10 font-bold rounded-sm ${inp}`}
                            >
                              <option value="" disabled>Select a topic...</option>
                              {["Delivery Update", "Meal Question", "Address Change", "Other"].map(opt => (
                                <option key={opt} value={opt} className="text-pink-700">{opt}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-pink-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-[9px] tracking-widest uppercase ${txt2} mb-2 font-bold`}>Message</label>
                          <textarea
                            required
                            rows={5}
                            placeholder="How can AJ KITCHEN help you today?"
                            value={supportForm.message}
                            onChange={e => setSupportForm(f => ({ ...f, message: e.target.value }))}
                            className={`w-full border text-sm px-4 py-3.5 focus:outline-none transition-colors resize-none font-medium rounded-sm ${inp}`}
                          />
                        </div>

                        {supportSent ? (
                          <div className="bg-green-50 border border-green-100 px-4 py-4 text-center mt-2 rounded-sm">
                            <p className="text-[10px] text-green-600 font-black tracking-widest uppercase">Ticket Submitted Successfully</p>
                          </div>
                        ) : (
                          <button
                            type="submit"
                            disabled={supportSending || !supportForm.subject || !supportForm.message}
                            className={`w-full mt-2 text-xs font-black tracking-[0.25em] uppercase py-4 transition-colors disabled:opacity-40 flex items-center justify-center gap-3 rounded-sm shadow-md ${btn}`}
                          >
                            {supportSending ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</> : "Submit Ticket"}
                          </button>
                        )}
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Previous Tickets List */}
              <div className="space-y-3">
                {tickets.length > 0 ? tickets.map(t => {
                  const isExpanded = expandedTicketId === t.id;
                  return (
                    <div key={t.id} className={`border ${border} transition-all duration-300 overflow-hidden rounded-sm shadow-sm ${isExpanded ? 'bg-pink-50/20' : bgCard}`}>
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-sm font-black text-pink-700 uppercase">{t.subject}</h3>
                            <span className={`text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm border font-black ${
                              t.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-200' :
                              t.status === 'Replied' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-pink-50 text-pink-400 border-pink-100'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-pink-300 uppercase tracking-widest font-black">
                            {new Date(t.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => setExpandedTicketId(isExpanded ? null : t.id)}
                          className="text-[9px] tracking-widest uppercase border border-pink-200 text-pink-400 px-4 py-2 hover:bg-pink-50 transition-colors whitespace-nowrap self-start sm:self-auto font-black rounded-sm"
                        >
                          {isExpanded ? 'Close' : 'View'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-pink-50">
                            <div className="p-5 sm:p-6 space-y-6">
                              <div>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-pink-300 mb-2 font-black">Your Inquiry</p>
                                <p className="text-sm text-pink-600 font-medium leading-relaxed whitespace-pre-wrap">{t.message}</p>
                              </div>
                              
                              {t.reply && (
                                <div className="bg-pink-100/30 border border-pink-100 p-5 rounded-sm shadow-inner">
                                  <p className="text-[9px] uppercase tracking-[0.2em] text-pink-500 mb-2 flex items-center gap-2 font-black">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                    AJ KITCHEN Support
                                  </p>
                                  <p className="text-sm text-pink-700 font-bold leading-relaxed whitespace-pre-wrap">{t.reply}</p>
                                </div>
                              )}

                              {!t.reply && t.status !== "Resolved" && (
                                <div className="bg-white/50 border border-pink-50 p-4 rounded-sm flex items-center gap-3">
                                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                                  <p className="text-[10px] text-pink-300 uppercase tracking-widest font-black">Awaiting Kitchen Response</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }) : (
                  <div className={`border ${border} bg-pink-50/10 p-12 text-center rounded-sm`}>
                    <p className="text-xs text-pink-300 tracking-widest uppercase mb-4 font-black">No tickets yet.</p>
                    <button 
                      onClick={() => setShowNewTicketForm(true)}
                      className="text-[10px] border-b-2 border-pink-200 text-pink-400 hover:text-pink-600 hover:border-pink-500 pb-0.5 transition-all uppercase tracking-widest font-black"
                    >
                      Need help? Open a ticket
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-pink-100 text-center">
                <p className={`text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-3 font-black`}>Direct Contact</p>
                <a href="mailto:hello@ajkitchen.com" className="text-sm font-black text-pink-500 hover:text-pink-700 transition-colors">
                  hello@ajkitchen.com
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Order Detail Modal ───────────────────────────────── */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-pink-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white border border-pink-100 w-full max-w-md max-h-[85vh] overflow-y-auto rounded-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-pink-50 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 font-black">Order Details</p>
                  <p className="text-sm font-mono font-black text-pink-700 mt-0.5">{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-pink-300 hover:text-pink-600 transition-colors">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1.5 border rounded-sm ${statusColor[selectedOrder.status] || "bg-pink-50 text-pink-300 border-pink-100"}`}>
                    {selectedOrder.status}
                  </span>
                  <p className="text-xs text-pink-400 font-bold">
                    {new Date(selectedOrder.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 font-black border-b border-pink-50 pb-2">Meals</p>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pink-50 rounded-sm border border-pink-100 relative overflow-hidden flex-shrink-0">
                         <Image src={item.image} alt={item.name} fill className="object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-pink-700 font-black uppercase truncate">{item.name}</p>
                        <p className="text-[10px] text-pink-400 font-bold">{item.size} × {item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-pink-50 pt-4">
                  <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-2 font-black">Delivery Address</p>
                  <p className="text-xs text-pink-600 font-medium leading-relaxed">
                    {selectedOrder.shipping_address}, {selectedOrder.shipping_city}
                    {selectedOrder.shipping_state ? `, ${selectedOrder.shipping_state}` : ""}
                    {selectedOrder.shipping_zip ? ` ${selectedOrder.shipping_zip}` : ""}
                  </p>
                </div>

                <div className="border-t border-pink-50 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-pink-300 uppercase tracking-widest font-black">Order Total</span>
                    <span className="text-xl font-black text-pink-600">$ {Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                  {selectedOrder.shipping_fee && (
                    <div className="flex justify-between items-center bg-pink-50 px-3 py-2 rounded-sm border border-pink-100">
                      <span className="text-[10px] text-pink-400 font-black uppercase tracking-widest">Delivery Fee</span>
                      <span className="text-sm font-black text-pink-600">$ {Number(selectedOrder.shipping_fee).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/track-order?id=${selectedOrder.id}`}
                  className="block w-full bg-pink-500 text-white text-center text-xs font-black tracking-[0.25em] uppercase py-4 hover:bg-pink-600 transition-all rounded-sm shadow-md"
                  onClick={() => setSelectedOrder(null)}
                >
                  Track Order
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
