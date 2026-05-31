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
  Delivered:    "bg-green-50 text-green-600 border border-green-200",
  "In Transit": "bg-blue-50 text-blue-600 border border-blue-200",
  Processing:   "bg-pink-50 text-pink-600 border border-pink-200",
  Pending:      "bg-pink-50/30 text-pink-300 border border-pink-100",
  Cancelled:    "bg-red-50 text-red-600 border border-red-200",
};

export default function AdminDashboard() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [menuCount, setMenuCount] = useState<number | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/orders").then(r => r.json()).catch(() => []),
      fetch("/api/admin/products").then(r => r.json()).catch(() => []),
    ]).then(([ordersData, productsData]) => {
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      const active = Array.isArray(productsData)
        ? productsData.filter((p: any) => p.in_stock).length
        : 0;
      setMenuCount(active);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === todayStr);
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0);

  const kpis = [
    { label: "Total Orders",  value: orders.length.toString(),                                         delta: `+${todayOrders.length} today`,      color: "text-green-600" },
    { label: "Revenue",       value: `$ ${totalRevenue.toFixed(0)}`,                                   delta: `+$${todayRevenue.toFixed(0)} today`,  color: "text-green-600" },
    { label: "Menu Items",    value: menuCount === null ? "…" : menuCount.toString(),                  delta: "Active meals",                        color: "text-pink-400" },
    { label: "Processing",    value: orders.filter(o => o.status === "Processing").length.toString(),  delta: "Needs Kitchen Attention",             color: "text-pink-600" },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8 bg-white p-2">
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-pink-600 uppercase">Kitchen Dashboard</h1>
        <p className="text-xs text-pink-300 mt-1 tracking-wide font-bold">Welcome back — AJ KITCHEN Admin</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-pink-50/20 border border-pink-100 p-5 rounded-sm shadow-sm">
            <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-3 font-black">{k.label}</p>
            {loading ? (
              <div className="h-8 w-20 bg-pink-50 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-black tracking-tight text-pink-600">{k.value}</p>
            )}
            <p className={`text-[10px] mt-1 tracking-wide font-bold ${k.color}`}>{k.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_340px] gap-5">
        {/* Recent Orders */}
        <div className="bg-white border border-pink-100 rounded-sm overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-pink-50 bg-pink-50/30">
            <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 font-black">Recent Orders</p>
            <Link href="/admin/orders" className="text-[9px] tracking-widest uppercase text-pink-300 hover:text-pink-500 transition-colors font-black">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-pink-200 text-xs tracking-widest uppercase animate-pulse font-bold">Loading Kitchen…</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-pink-200 text-xs tracking-widest uppercase font-bold">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[520px]">
                <thead>
                  <tr className="border-b border-pink-50 bg-pink-50/10">
                    {["Order", "Customer", "Amount", "Status", "Date"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[9px] tracking-widest uppercase text-pink-300 font-black">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-pink-50/50 hover:bg-pink-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-pink-700 font-bold">{o.id}</td>
                      <td className="px-5 py-3.5 text-pink-600 font-medium">{o.customer_name}</td>
                      <td className="px-5 py-3.5 text-pink-600 font-bold">$ {Number(o.total).toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-sm ${statusColor[o.status] || "bg-pink-50 text-pink-300"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-pink-400 font-bold">
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
        <div className="bg-pink-50/10 border border-pink-100 rounded-sm p-5 h-fit shadow-sm">
          <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 mb-4 font-black">Quick Actions</p>
          <div className="space-y-2">
            {[
              { label: "View All Orders",   href: "/admin/orders",   icon: "◈" },
              { label: "Manage Menu Items", href: "/admin/products", icon: "+" },
              { label: "Kitchen Settings",  href: "/admin/settings", icon: "◌" },
              { label: "Go to Storefront",  href: "/",               icon: "↗" },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                target={a.icon === "↗" ? "_blank" : undefined}
                className="flex items-center gap-3 px-3 py-2.5 border border-pink-100 bg-white text-xs text-pink-400 font-black hover:bg-pink-50 hover:text-pink-600 transition-all rounded-sm shadow-sm"
              >
                <span className="text-pink-200 w-4 text-center">{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Menu Items Preview ─────────────────────────── */}
      <div className="bg-white border border-pink-100 rounded-sm shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-pink-50 bg-pink-50/30">
          <p className="text-[9px] tracking-[0.3em] uppercase text-pink-400 font-black">Menu Items</p>
          <Link href="/admin/products" className="text-[9px] tracking-widest uppercase text-pink-300 hover:text-pink-500 transition-colors font-black">
            Manage All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-36 bg-pink-50/40 animate-pulse rounded-sm border border-pink-50" />
            ))}
          </div>
        ) : menuCount === 0 ? (
          <div className="p-10 text-center">
            <p className="text-pink-200 text-xs font-bold tracking-widest uppercase mb-4">No menu items yet.</p>
            <Link href="/admin/products"
              className="inline-block bg-pink-500 text-white text-[10px] font-black tracking-[0.2em] uppercase px-6 py-3 rounded-sm hover:bg-pink-600 transition-all">
              + Add First Meal
            </Link>
          </div>
        ) : (
          <MenuGrid />
        )}
      </div>
    </div>
  );
}

function MenuGrid() {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/admin/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : []));
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-5">
      {products.map(p => (
        <div key={p.id} className={`border border-pink-100 rounded-sm overflow-hidden bg-white shadow-sm ${!p.in_stock ? "opacity-50" : ""}`}>
          <div className="h-28 bg-pink-50 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt={p.name} className="w-full h-full object-cover"
              onError={e => { e.currentTarget.style.display = "none"; }} />
          </div>
          <div className="p-2">
            <p className="text-[8px] text-pink-300 font-black uppercase tracking-widest truncate">{p.category}</p>
            <p className="text-[11px] font-black text-pink-700 uppercase truncate">{p.name}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] font-black text-pink-600">$ {p.price}</p>
              <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${p.in_stock ? "bg-green-50 text-green-500" : "bg-red-50 text-red-400"}`}>
                {p.in_stock ? "Live" : "Off"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
