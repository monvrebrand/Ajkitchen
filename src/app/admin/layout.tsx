"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";


const NAV = [
  { href: "/admin",           label: "Dashboard", icon: "▣" },
  { href: "/admin/orders",    label: "Orders",    icon: "◈" },
  { href: "/admin/products",  label: "Products",  icon: "◇" },
  { href: "/admin/support",   label: "Support",   icon: "◎" },
  { href: "/admin/analytics", label: "Analytics", icon: "△" },
  { href: "/admin/settings",  label: "Settings",  icon: "◌" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const logout = async () => {
    await fetch('/api/auth/admin', { method: 'DELETE' });
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  const activeLabel = NAV.find(
    n => n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href))
  )?.label ?? "Dashboard";

  return (
    <div className="min-h-screen bg-pink-50 flex text-pink-700 font-medium">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-pink-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 flex flex-col w-64 bg-white border-r border-pink-100 transition-transform duration-300 shadow-xl
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="px-4 py-4 border-b border-pink-100 flex-shrink-0 bg-pink-50/50">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-pink-100 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <Image src="/logo.jpg" alt="AJ Kitchen" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] uppercase text-pink-600">AJ KITCHEN</p>
              <p className="text-[8px] tracking-[0.25em] uppercase text-pink-300 font-bold">Admin Console</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase transition-colors rounded-sm font-black
                  ${active
                    ? "bg-pink-500 text-white shadow-md"
                    : "text-pink-300 hover:text-pink-600 hover:bg-pink-50/50"
                  }`}
              >
                <span className="text-sm w-4 text-center opacity-70">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-pink-100 flex-shrink-0 space-y-0.5">
          <Link
            href="/"
            target="_blank"
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase text-pink-300 hover:text-pink-600 transition-colors font-bold"
          >
            <span className="text-sm w-4 text-center">↗</span>
            View Store
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors font-black"
          >
            <span className="text-sm w-4 text-center">⊗</span>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 bg-white/95 backdrop-blur border-b border-pink-100 flex items-center justify-between px-5 md:px-8 flex-shrink-0 shadow-sm">
          <button
            className="md:hidden text-pink-400 hover:text-pink-600 transition-colors p-1"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle sidebar"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <p className="text-[10px] tracking-[0.3em] uppercase text-pink-300 hidden md:block font-black">{activeLabel}</p>
          <div className="flex items-center gap-2 ml-auto">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <span className="text-[9px] tracking-widest uppercase text-pink-300 font-black">Kitchen Live</span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 overflow-auto bg-pink-50/5">
          {children}
        </main>
      </div>
    </div>
  );
}
