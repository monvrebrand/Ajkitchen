"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  shipping_city: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: string;
  created_at: string;
};

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [returnRate, setReturnRate] = useState(0);

  const [revenueData, setRevenueData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [ordersData, setOrdersData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [weekDays, setWeekDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  
  const [topProducts, setTopProducts] = useState<{ name: string; revenue: string; units: number; pct: number }[]>([]);
  const [geoData, setGeoData] = useState<{ region: string; pct: number; orders: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/orders");
        const orders: Order[] = await res.json();
        
        if (!Array.isArray(orders)) {
          setLoading(false);
          return;
        }

        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentOrders = orders.filter(o => new Date(o.created_at) >= sevenDaysAgo);

        const revenue = recentOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const orderCount = recentOrders.length;
        const avg = orderCount > 0 ? revenue / orderCount : 0;
        
        const returned = recentOrders.filter(o => o.status === "Cancelled").length;
        const retRate = orderCount > 0 ? (returned / orderCount) * 100 : 0;

        setTotalRevenue(revenue);
        setTotalOrders(orderCount);
        setAvgOrderValue(avg);
        setReturnRate(retRate);

        const days: string[] = [];
        const revArr = [0, 0, 0, 0, 0, 0, 0];
        const ordArr = [0, 0, 0, 0, 0, 0, 0];

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        setWeekDays(days);

        recentOrders.forEach(o => {
          const oDate = new Date(o.created_at);
          // Zero out hours to calculate exact day differences
          const d1 = new Date(oDate); d1.setHours(0,0,0,0);
          const d2 = new Date(now); d2.setHours(0,0,0,0);
          const diffTime = Math.abs(d2.getTime() - d1.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const idx = 6 - diffDays;
          if (idx >= 0 && idx < 7) {
            revArr[idx] += Number(o.total || 0);
            ordArr[idx] += 1;
          }
        });

        setRevenueData(revArr);
        setOrdersData(ordArr);

        const productMap: Record<string, { units: number; rev: number }> = {};
        recentOrders.forEach(o => {
          if (Array.isArray(o.items)) {
            o.items.forEach(item => {
              if (!productMap[item.name]) productMap[item.name] = { units: 0, rev: 0 };
              productMap[item.name].units += Number(item.qty || 1);
              productMap[item.name].rev += Number(item.price || 0) * Number(item.qty || 1);
            });
          }
        });

        const sortedProducts = Object.keys(productMap)
          .map(name => ({ name, ...productMap[name] }))
          .sort((a, b) => b.rev - a.rev)
          .slice(0, 5);
        
        const totalProdRev = sortedProducts.reduce((sum, p) => sum + p.rev, 0) || 1;

        setTopProducts(sortedProducts.map(p => ({
          name: p.name,
          units: p.units,
          revenue: `GHS ${p.rev.toFixed(2)}`,
          pct: (p.rev / totalProdRev) * 100
        })));

        const geoMap: Record<string, number> = {};
        recentOrders.forEach(o => {
          const city = o.shipping_city || "Unknown";
          geoMap[city] = (geoMap[city] || 0) + 1;
        });

        const sortedGeo = Object.keys(geoMap)
          .map(region => ({ region, orders: geoMap[region] }))
          .sort((a, b) => b.orders - a.orders)
          .slice(0, 5);

        const totalGeoOrders = sortedGeo.reduce((sum, g) => sum + g.orders, 0) || 1;

        setGeoData(sortedGeo.map(g => ({
          region: g.region,
          orders: g.orders,
          pct: (g.orders / totalGeoOrders) * 100
        })));

      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const maxRevenue = Math.max(...revenueData) || 1;
  const maxOrders = Math.max(...ordersData) || 1;

  if (loading) {
    return <div className="py-16 text-center text-white/25 text-xs tracking-widest uppercase animate-pulse">Loading analytics…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-white/90 uppercase">Analytics</h1>
        <p className="text-xs text-white/30 mt-0.5">Last 7 days — Series 01 Launch Period</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: `GHS ${totalRevenue.toFixed(2)}`, change: "+", up: true },
          { label: "Total Orders", value: totalOrders.toString(), change: "+", up: true },
          { label: "Avg Order Value", value: `GHS ${avgOrderValue.toFixed(2)}`, change: "+", up: true },
          { label: "Cancel Rate", value: `${returnRate.toFixed(1)}%`, change: "-", up: false },
        ].map(k => (
          <div key={k.label} className="bg-white/[0.03] border border-white/5 p-5 rounded-sm">
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-3">{k.label}</p>
            <p className="text-2xl font-black tracking-tight text-white/90">{k.value}</p>
            <p className="text-[10px] mt-1 tracking-wide text-white/40">
              {k.label === "Cancel Rate" ? "vs total orders" : "Last 7 days"}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Revenue Chart */}
        <div className="bg-white/[0.03] border border-white/5 rounded-sm p-5">
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-6">Revenue (7 days)</p>
          <div className="flex items-end gap-2 h-36">
            {revenueData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[8px] text-white/25 font-mono">GHS {v}</span>
                <div className="w-full bg-white/90 rounded-sm transition-all" style={{ height: `${(v / maxRevenue) * 100}px`, minHeight: '2px' }} />
                <span className="text-[8px] text-white/30">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white/[0.03] border border-white/5 rounded-sm p-5">
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-6">Orders (7 days)</p>
          <div className="flex items-end gap-2 h-36">
            {ordersData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[8px] text-white/25 font-mono">{v}</span>
                <div className="w-full bg-white/40 rounded-sm transition-all" style={{ height: `${(v / maxOrders) * 100}px`, minHeight: '2px' }} />
                <span className="text-[8px] text-white/30">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="bg-white/[0.03] border border-white/5 rounded-sm p-5">
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-5">Top Products</p>
          <div className="space-y-4">
            {topProducts.length === 0 && <p className="text-xs text-white/30">No products sold in the last 7 days.</p>}
            {topProducts.map(p => (
              <div key={p.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/65">{p.name}</span>
                  <div className="flex gap-3 text-right">
                    <span className="text-white/35">{p.units} sold</span>
                    <span className="text-white/70 font-medium w-16 text-right">{p.revenue}</span>
                  </div>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white/60 rounded-full" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geography */}
        <div className="bg-white/[0.03] border border-white/5 rounded-sm p-5">
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-5">Orders by Region</p>
          <div className="space-y-4">
            {geoData.length === 0 && <p className="text-xs text-white/30">No regions tracked in the last 7 days.</p>}
            {geoData.map(g => (
              <div key={g.region}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-white/65">{g.region}</span>
                  <div className="flex gap-3">
                    <span className="text-white/35">{g.orders} orders</span>
                    <span className="text-white/60 w-8 text-right">{g.pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white/40 rounded-full" style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
