"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";

type UserSession = {
  name: string;
  email: string;
  initials: string;
};

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { totalItems, openCart } = useCart();

  const [user,        setUser]        = useState<UserSession | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  /* ── Load session from JWT cookie via /api/auth/me ─────────── */
  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(({ user: u }) => {
        if (u) {
          const name  = u.full_name || u.email || 'Member';
          const parts = name.split(' ');
          const initials = parts.length >= 2
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();
          setUser({ name, email: u.email, initials });
        }
      })
      .catch(() => {});
  }, []);

  /* ── Close panels on route change ──────────────────────── */
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  /* ── Close profile dropdown on outside click ────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProfileOpen(false);
    router.push('/');
    router.refresh();
  };

  /* ── Skip admin pages ────────────────────────────────────── */
  if (pathname?.startsWith("/admin")) return null;

  const baseLinks = [
    { href: "/",            label: "Home"  },
    { href: "/store",       label: "Menu"  },
    { href: "/track-order", label: "Track" },
  ];
  const allLinks = mounted && user
    ? [...baseLinks, { href: "/account", label: "Orders" }]
    : baseLinks;

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-[300] bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-pink-100 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.jpg"
                alt="AJ Kitchen Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="text-sm font-black tracking-[0.2em] uppercase text-pink-600 group-hover:text-pink-700 transition-colors hidden sm:block">
              AJ KITCHEN
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {baseLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                prefetch={true}
                className={`text-xs tracking-[0.2em] uppercase transition-colors font-black ${
                  pathname === l.href
                    ? "text-pink-600"
                    : "text-pink-300 hover:text-pink-600"
                }`}
              >
                {l.label}
              </Link>
            ))}

            {mounted && user && (
              <Link
                href="/account"
                prefetch={true}
                className={`text-xs tracking-[0.2em] uppercase transition-colors font-black ${
                  pathname === "/account"
                    ? "text-pink-600"
                    : "text-pink-300 hover:text-pink-600"
                }`}
              >
                Orders
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">

            {/* Cart button — always rendered, badge shown only after mount */}
            <button
              id="cart-toggle"
              onClick={openCart}
              className="relative transition-colors text-pink-400 hover:text-pink-600"
              aria-label="Open cart"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Profile / Account — only after mount */}
            {mounted ? (
              user ? (
                <div className="relative hidden md:block" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="w-8 h-8 rounded-full bg-pink-500 text-white text-[10px] font-black tracking-widest flex items-center justify-center hover:bg-pink-600 transition-colors shadow-md"
                    aria-label="Profile menu"
                  >
                    {user.initials}
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-52 bg-white border border-pink-100 shadow-xl z-50 rounded-md overflow-hidden"
                      >
                        <div className="px-4 py-4 border-b border-pink-50 bg-pink-50/50">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-pink-500 text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">
                              {user.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-pink-700 truncate">{user.name}</p>
                              <p className="text-[9px] text-pink-400 tracking-wide truncate font-bold">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          {[
                            { href: "/account",             label: "Orders",   icon: "◈" },
                            { href: "/account?tab=profile", label: "Profile",  icon: "◎" },
                            { href: "/track-order",         label: "Track",    icon: "△" },
                            { href: "/store",               label: "Menu",     icon: "◇" },
                          ].map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-2.5 text-xs text-pink-500 hover:text-pink-700 hover:bg-pink-50 transition-all font-black"
                            >
                              <span className="text-pink-200 w-3 text-center text-sm">{item.icon}</span>
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-pink-50 py-2">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 transition-all font-black"
                          >
                            <span className="w-3 text-center">⊗</span>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden md:block text-xs tracking-[0.2em] uppercase font-black transition-colors text-pink-400 hover:text-pink-600"
                >
                  Account
                </Link>
              )
            ) : (
              /* SSR placeholder — same size as Account link, invisible */
              <span className="hidden md:block w-16 h-4" aria-hidden />
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden transition-colors text-pink-500 hover:text-pink-700"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ─────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[250] bg-white pt-20 px-6 flex flex-col gap-6 md:hidden overflow-y-auto pb-10"
          >
            {/* Logo in mobile menu header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-pink-100">
                <Image src="/logo.jpg" alt="AJ Kitchen" width={56} height={56} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tighter text-pink-600 uppercase">AJ KITCHEN</p>
                <p className="text-[9px] text-pink-300 tracking-widest uppercase font-bold">Ghanaian Homemade Food</p>
              </div>
            </div>
            {allLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-4xl font-black tracking-tighter text-pink-600 uppercase"
              >
                {l.label}
              </Link>
            ))}

            <div className="border-t border-pink-100 pt-6 flex flex-col gap-4 mt-2">
              {mounted && user ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-pink-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                      {user.initials}
                    </div>
                    <div>
                      <p className="text-sm text-pink-700 font-black">{user.name}</p>
                      <p className="text-[10px] text-pink-400 font-bold">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-pink-600 tracking-widest uppercase text-left font-black"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login"  className="text-lg text-pink-500 tracking-widest uppercase font-black">Login</Link>
                  <Link href="/auth/signup" className="text-lg text-pink-400 tracking-widest uppercase font-bold">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
