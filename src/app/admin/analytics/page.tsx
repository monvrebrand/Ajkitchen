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
  const [cancelRate, setCancelRate] = useState(0);

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
        const cRate = orderCount > 0 ? (returned / orderCount) * 100 : 0;

        setTotalRevenue(revenue);
        setTotalOrders(orderCount);
        setAvgOrderValue(avg);
        setCancelRate(cRate);

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
          revenue: `$ ${p.rev.toFixed(2)}`,
          pct: (p.rev / totalProdRev) * 100
        })));

        const geoMap: Record<string, number> = {};
        recentOrders.forEach(o => {
          const city = o.shipping_city || "Columbus";
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
    return <div className="py-16 text-center text-pink-200 text-xs tracking-widest uppercase animate-pulse font-black">Analyzing Kitchen Data…</div>;
  }

  return (
    <div className="space-y-8 bg-white p-2">
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-pink-600 uppercase">Kitchen Analytics</h1>
        <p className="text-xs text-pink-300 mt-1 tracking-wide font-bold">Last 7 days performance</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$ ${totalRevenue.toFixed(2)}` },
          { label: "Total Orders", value: totalOrders.toString() },
          { label: "Avg Order", value: `$ ${avgOrderValue.toFixed(2)}` },
          { label: "Cancel Rate", value: `${cancelRate.toFixed(1)}%` },
        ].map(k => (
          <div key={k.label} className="bg-pink-50/20 border border-pink-100 p-5 rounded-sm shadow-sm">
            <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-3 font-black">{k.label}</p>
            <p className="text-2xl font-black tracking-tight text-pink-600">{k.value}</p>
            <p className="text-[10px] mt-1 tracking-wide text-pink-400 font-bold">Past 7 days</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white border border-pink-100 rounded-sm p-6 shadow-sm">
          <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-8 font-black">Revenue Trend</p>
          <div className="flex items-end gap-2 h-40">
            {revenueData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[8px] text-pink-400 font-bold font-mono">${v.toFixed(0)}</span>
                <div className="w-full bg-pink-500 rounded-sm transition-all shadow-sm" style={{ height: `${(v / maxRevenue) * 120}px`, minHeight: '4px' }} />
                <span className="text-[8px] text-pink-300 font-black">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white border border-pink-100 rounded-sm p-6 shadow-sm">
          <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-8 font-black">Order Volume</p>
          <div className="flex items-end gap-2 h-40">
            {ordersData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[8px] text-pink-400 font-bold font-mono">{v}</span>
                <div className="w-full bg-pink-300 rounded-sm transition-all shadow-sm" style={{ height: `${(v / maxOrders) * 120}px`, minHeight: '4px' }} />
                <span className="text-[8px] text-pink-300 font-black">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Meals */}
        <div className="bg-white border border-pink-100 rounded-sm p-6 shadow-sm">
          <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-6 font-black">Bestselling Meals</p>
          <div className="space-y-5">
            {topProducts.length === 0 && <p className="text-xs text-pink-200 font-bold">No data yet.</p>}
            {topProducts.map(p => (
              <div key={p.name}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-pink-700 font-black uppercase tracking-tight">{p.name}</span>
                  <div className="flex gap-4 text-right">
                    <span className="text-pink-300 font-bold">{p.units} orders</span>
                    <span className="text-pink-600 font-black w-16 text-right">{p.revenue}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-pink-50 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full shadow-sm" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geography */}
        <div className="bg-white border border-pink-100 rounded-sm p-6 shadow-sm">
          <p className="text-[9px] tracking-[0.3em] uppercase text-pink-300 mb-6 font-black">Orders by Columbus Area</p>
          <div className="space-y-5">
            {geoData.length === 0 && <p className="text-xs text-pink-200 font-bold">No data yet.</p>}
            {geoData.map(g => (
              <div key={g.region}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-pink-700 font-black uppercase tracking-tight">{g.region}</span>
                  <div className="flex gap-4">
                    <span className="text-pink-300 font-bold">{g.orders} drops</span>
                    <span className="text-pink-600 font-black w-10 text-right">{g.pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-pink-50 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-400 rounded-full shadow-sm" style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
