"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

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
  const checked  = useRef(false);

  const [authed,      setAuthed]      = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Run auth check ONCE on mount only — re-running on pathname change
  // causes a re-render mid-click which swallows the navigation event.
  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const ok = sessionStorage.getItem("monvre_admin") === "true";
    if (!ok && pathname !== "/admin/login") {
      router.replace("/admin/login");
    } else {
      setAuthed(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close sidebar when route changes (separate, lightweight effect)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const logout = () => {
    sessionStorage.removeItem("monvre_admin");
    router.push("/admin/login");
  };

  // Login page renders immediately — no auth gate needed
  if (pathname === "/admin/login") return <>{children}</>;

  // Hide content until auth is confirmed (avoids flash of protected content)
  if (!authed) return null;

  const activeLabel = NAV.find(
    n => n.href === pathname || (n.href !== "/admin" && pathname.startsWith(n.href))
  )?.label ?? "Dashboard";

  return (
    <div className="min-h-screen bg-[#030303] flex text-white">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 flex flex-col w-64 bg-[#070707] border-r border-white/5 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5 flex-shrink-0">
          <Link href="/admin">
            <p className="text-xs font-black tracking-[0.35em] uppercase text-white">MONVRE</p>
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mt-0.5">Admin Console</p>
          </Link>
        </div>

        {/* Nav links — plain <a> avoids any router state re-renders */}
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
                className={`flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase transition-colors rounded-sm
                  ${active
                    ? "bg-white/8 text-white"
                    : "text-white/35 hover:text-white/75 hover:bg-white/[0.04]"
                  }`}
              >
                <span className="text-sm w-4 text-center opacity-70">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-white/5 flex-shrink-0 space-y-0.5">
          <Link
            href="/"
            target="_blank"
            prefetch={false}
            className="flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase text-white/20 hover:text-white/45 transition-colors"
          >
            <span className="text-sm w-4 text-center">↗</span>
            View Store
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase text-red-500/35 hover:text-red-400 transition-colors"
          >
            <span className="text-sm w-4 text-center">⊗</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 bg-[#030303]/95 backdrop-blur border-b border-white/5 flex items-center justify-between px-5 md:px-8 flex-shrink-0">
          <button
            className="md:hidden text-white/40 hover:text-white transition-colors p-1"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/20 hidden md:block">{activeLabel}</p>
          <div className="flex items-center gap-2 ml-auto">
            <span className="w-2 h-2 rounded-full bg-green-500/70" />
            <span className="text-[9px] tracking-widest uppercase text-white/20">Admin</span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
