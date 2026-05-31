"use client";

import { useEffect, useState } from "react";

type Status = "All" | "Pending" | "Preparing" | "Out for Delivery" | "On the Way" | "Delivered" | "Cancelled";

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  items: { name: string; qty: number; price: number; note?: string }[];
  total: number;
  currency: string;
  status: string;
  tracking_number?: string;
  shipping_fee?: number;
  note?: string;
  payment_method?: string;
  payment_screenshot?: string;
  created_at: string;
};

const STATUS_OPTIONS: Status[] = ["All", "Pending", "Preparing", "Out for Delivery", "On the Way", "Delivered", "Cancelled"];

const EDIT_STATUSES = ["Pending", "Preparing", "Out for Delivery", "On the Way", "Delivered", "Cancelled"];

const statusColor: Record<string, string> = {
  Delivered:          "bg-green-50 text-green-600 border border-green-200",
  "On the Way":       "bg-blue-50 text-blue-600 border border-blue-200",
  "Out for Delivery": "bg-cyan-50 text-cyan-600 border border-cyan-200",
  Preparing:          "bg-amber-50 text-amber-600 border border-amber-200",
  Pending:            "bg-pink-50/30 text-pink-300 border border-pink-100",
  Cancelled:          "bg-red-50 text-red-600 border border-red-200",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNum, setTrackingNum] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const fetchOrders = () => {
      fetch("/api/admin/orders")
        .then(r => r.json())
        .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false));
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 30_000);
    return () => clearInterval(interval);
  }, []);

  const filtered = orders.filter(o => {
    const matchStatus = filter === "All" || o.status === filter;
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const selectedOrder = orders.find(o => o.id === selected);

  const openEdit = (o: Order) => {
    setSelected(o.id);
    setNewStatus(o.status);
    setTrackingNum(o.tracking_number || "");
    setShippingFee(o.shipping_fee ? String(o.shipping_fee) : "");
    setSaveMsg("");
  };

  const applyStatus = async () => {
    if (!selected || !newStatus) return;
    setSaving(true);
    setSaveMsg("");
    const body: Record<string, string | number> = { id: selected, status: newStatus };
    if (newStatus === "Shipped") {
      if (trackingNum.trim()) body.tracking_number = trackingNum.trim();
      if (shippingFee.trim()) body.shipping_fee = Number(shippingFee.trim());
    }
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o =>
        o.id === selected
          ? { 
              ...o, 
              status: newStatus, 
              tracking_number: body.tracking_number as string ?? o.tracking_number,
              shipping_fee: body.shipping_fee as number ?? o.shipping_fee
            }
          : o
      ));
      setSaveMsg("✓ Updated successfully");
      setTimeout(() => { setSelected(null); setTrackingNum(""); setSaveMsg(""); }, 1000);
    } else {
      setSaveMsg("Failed to update. Try again.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 bg-white p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-pink-600 uppercase">Order Management</h1>
          <p className="text-xs text-pink-300 mt-0.5 font-bold">{orders.length} total meals ordered</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-[9px] font-black tracking-[0.2em] uppercase px-3 py-2 border-2 transition-all rounded-sm
                ${filter === s ? "border-pink-500 bg-pink-500 text-white shadow-md" : "border-pink-100 text-pink-300 hover:border-pink-300 hover:text-pink-600"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by order ID, customer name or email…"
        className="w-full bg-white border-2 border-pink-100 text-pink-700 text-xs px-4 py-3 placeholder:text-pink-200 focus:outline-none focus:border-pink-500 transition-colors font-bold rounded-sm shadow-sm" />

      <div className="bg-white border border-pink-100 rounded-sm overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-pink-200 text-xs tracking-widest uppercase animate-pulse font-black">Fetching Kitchen Orders…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-pink-50 bg-pink-50/20">
                  {["Order ID", "Customer", "Email", "Items", "Amount", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-[9px] tracking-widest uppercase text-pink-300 font-black">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-pink-50/50 hover:bg-pink-50/20 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-pink-700 font-bold text-[11px]">{o.id}</td>
                    <td className="px-4 py-3.5 text-pink-600 font-bold">{o.customer_name}</td>
                    <td className="px-4 py-3.5 text-pink-400 font-medium">{o.customer_email}</td>
                    <td className="px-4 py-3.5 text-pink-500 text-center font-black">{o.items?.length || 0}</td>
                    <td className="px-4 py-3.5 text-pink-600 font-black">{o.currency} {Number(o.total).toFixed(2)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-sm ${statusColor[o.status] || "bg-pink-50 text-pink-300"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-pink-300 font-bold">
                      {new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => openEdit(o)}
                        className="text-[9px] font-black tracking-widest uppercase text-pink-400 hover:text-pink-600 border border-pink-100 hover:border-pink-300 px-3 py-1.5 transition-all rounded-sm bg-white shadow-sm">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-pink-200 text-xs tracking-widest uppercase font-black">No orders found in the kitchen</div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[500] bg-pink-900/60 backdrop-blur-sm flex items-center justify-center p-3" onClick={() => setSelected(null)}>
          <div className="bg-white border border-pink-100 w-full max-w-sm rounded-md shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="px-5 py-3 border-b border-pink-50 flex-shrink-0">
              <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 font-black">Update Kitchen Status</p>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3 text-[10px]">

              {/* Order info rows */}
              {[
                ["Order",    selectedOrder.id],
                ["Customer", selectedOrder.customer_name],
                ["Amount",   `${selectedOrder.currency} ${Number(selectedOrder.total).toFixed(2)}`],
                ["Address",  [selectedOrder.shipping_address, selectedOrder.shipping_city, selectedOrder.shipping_state, selectedOrder.shipping_zip].filter(Boolean).join(', ')],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between border-b border-pink-50/50 pb-1 gap-3">
                  <span className="text-pink-300 font-black uppercase tracking-tighter flex-shrink-0">{label}</span>
                  <span className="font-bold text-pink-700 text-right truncate">{val}</span>
                </div>
              ))}

              {/* Items */}
              <div className="border-b border-pink-50/50 pb-2">
                <p className="text-pink-300 font-black uppercase tracking-tighter mb-1">Items</p>
                <ul className="space-y-1">
                  {selectedOrder.items?.map((item, i) => (
                    <li key={i} className="text-pink-600 font-bold flex flex-wrap items-center gap-1">
                      <span>{item.name} × {item.qty}</span>
                      {item.note && (
                        <span className="text-[9px] text-amber-600 font-black bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200">
                          📝 {item.note}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order-level note */}
              {selectedOrder.note && (
                <div className="bg-amber-50 border border-amber-200 rounded-sm px-2.5 py-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-amber-600 mb-0.5">📝 Customer Note</p>
                  <p className="text-[10px] text-amber-800 font-bold leading-snug">{selectedOrder.note}</p>
                </div>
              )}

              {/* Payment method */}
              <div className="flex items-center justify-between border-b border-pink-50/50 pb-2">
                <p className="text-pink-300 font-black uppercase tracking-tighter">Payment</p>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                  !selectedOrder.payment_method
                    ? "bg-gray-50 text-gray-400 border border-gray-200"
                    : selectedOrder.payment_method === "zelle"
                    ? "bg-purple-50 text-purple-600 border border-purple-200"
                    : selectedOrder.payment_method === "card"
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "bg-green-50 text-green-600 border border-green-200"
                }`}>
                  {!selectedOrder.payment_method
                    ? "Unknown"
                    : selectedOrder.payment_method === "zelle"
                    ? "Zelle"
                    : selectedOrder.payment_method === "card"
                    ? "Card"
                    : "CashApp"}
                </span>
              </div>

              {/* Screenshot */}
              {selectedOrder.payment_screenshot ? (
                <div>
                  <p className="text-[8px] text-pink-300 font-black uppercase tracking-widest mb-1">Payment Screenshot</p>
                  <a href={selectedOrder.payment_screenshot} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedOrder.payment_screenshot}
                      alt="Payment screenshot"
                      className="w-full max-h-36 object-contain rounded-sm border border-pink-100 hover:opacity-90 transition-opacity cursor-zoom-in"
                    />
                    <p className="text-[8px] text-pink-400 font-bold text-center mt-0.5 underline">View full image ↗</p>
                  </a>
                </div>
              ) : (
                <p className="text-[9px] text-pink-200 font-bold">No screenshot uploaded</p>
              )}

              {/* Status selector */}
              <div>
                <label className="block text-[8px] tracking-widest uppercase text-pink-400 mb-1.5 font-black">Change Status</label>
                <div className="relative w-full">
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full bg-pink-50 border border-pink-100 text-pink-700 text-xs px-3 py-2.5 focus:outline-none focus:border-pink-500 appearance-none cursor-pointer pr-8 font-bold rounded-sm"
                  >
                    {EDIT_STATUSES.map(s => (
                      <option key={s} value={s} className="text-pink-700 font-bold">{s}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-pink-300">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {saveMsg && (
                <p className={`text-xs font-black text-center p-2 rounded-sm ${saveMsg.startsWith("✓") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{saveMsg}</p>
              )}
            </div>

            {/* Footer buttons — always visible */}
            <div className="px-5 py-3 border-t border-pink-50 flex gap-2 flex-shrink-0">
              {selectedOrder.status === "Pending" && (
                <button
                  onClick={async () => {
                    setNewStatus("Preparing");
                    setSaving(true);
                    const res = await fetch("/api/admin/orders", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: selectedOrder.id, status: "Preparing" }),
                    });
                    if (res.ok) {
                      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: "Preparing" } : o));
                      setSaveMsg("✓ Payment confirmed");
                      setTimeout(() => { setSelected(null); setSaveMsg(""); }, 1000);
                    }
                    setSaving(false);
                  }}
                  disabled={saving}
                  className="flex-1 bg-green-500 text-white text-[10px] font-black tracking-widest uppercase py-3 hover:bg-green-600 transition-colors disabled:opacity-50 rounded-sm shadow-md"
                >
                  ✓ Confirm Payment
                </button>
              )}
              <button onClick={applyStatus} disabled={saving}
                className="flex-1 bg-pink-500 text-white text-[10px] font-black tracking-widest uppercase py-3 hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded-sm shadow-md">
                {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save Status
              </button>
              <button onClick={() => setSelected(null)} className="px-5 border border-pink-100 text-pink-300 hover:text-pink-500 text-[10px] tracking-widest uppercase transition-colors font-black rounded-sm">
                Exit
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
