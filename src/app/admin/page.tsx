"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  items: { name: string }[];
};

const statusColor: Record<string, string> = {
  Delivered:    "bg-green-500/15 text-green-400",
  "In Transit": "bg-blue-500/15 text-blue-400",
  Processing:   "bg-amber-500/15 text-amber-400",
  Pending:      "bg-white/8 text-white/50",
  Cancelled:    "bg-red-500/15 text-red-400",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === todayStr);
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0);

  const kpis = [
    { label: "Total Orders",  value: orders.length.toString(),              delta: `+${todayOrders.length} today`,    color: "text-green-400" },
    { label: "Revenue",       value: `GHS ${totalRevenue.toFixed(0)}`,      delta: `+GHS ${todayRevenue.toFixed(0)} today`, color: "text-green-400" },
    { label: "Products",      value: "6",                                    delta: "Active",                           color: "text-white/50" },
    { label: "Processing",    value: orders.filter(o => o.status === "Processing").length.toString(), delta: "Need attention", color: "text-amber-400" },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-white/90 uppercase">Dashboard</h1>
        <p className="text-xs text-white/30 mt-1 tracking-wide">Welcome back — MONVRE Admin</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white/[0.03] border border-white/5 p-5 rounded-sm">
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-3">{k.label}</p>
            {loading ? (
              <div className="h-8 w-20 bg-white/5 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-black tracking-tight text-white/90">{k.value}</p>
            )}
            <p className={`text-[10px] mt-1 tracking-wide ${k.color}`}>{k.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_340px] gap-5">
        {/* Recent Orders — REAL */}
        <div className="bg-white/[0.03] border border-white/5 rounded-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/40">Recent Orders</p>
            <Link href="/admin/orders" className="text-[9px] tracking-widest uppercase text-white/25 hover:text-white transition-colors">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-white/25 text-xs tracking-widest uppercase animate-pulse">Loading…</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-white/25 text-xs tracking-widest uppercase">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[520px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Order", "Customer", "Amount", "Status", "Date"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[9px] tracking-widest uppercase text-white/20 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-white/60">{o.id}</td>
                      <td className="px-5 py-3.5 text-white/70">{o.customer_name}</td>
                      <td className="px-5 py-3.5 text-white/60">GHS {Number(o.total).toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm ${statusColor[o.status] || "bg-white/8 text-white/40"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-white/30">
                        {new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/[0.03] border border-white/5 rounded-sm p-5 h-fit">
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-4">Quick Actions</p>
          <div className="space-y-2">
            {[
              { label: "View All Orders",   href: "/admin/orders",   icon: "◈" },
              { label: "Manage Products",   href: "/admin/products", icon: "+" },
              { label: "Site Settings",     href: "/admin/settings", icon: "◌" },
              { label: "View Storefront",   href: "/",               icon: "↗" },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                target={a.icon === "↗" ? "_blank" : undefined}
                className="flex items-center gap-3 px-3 py-2.5 border border-white/5 text-xs text-white/45 hover:text-white hover:border-white/15 transition-all rounded-sm"
              >
                <span className="text-white/30 w-4 text-center">{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
