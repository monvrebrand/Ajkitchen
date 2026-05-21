"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";

type UserSession = {
  name: string;
  email: string;
  initials: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check Supabase session
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email || "Member";
        const parts = name.split(" ");
        const initials = parts.length >= 2
          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
          : name.slice(0, 2).toUpperCase();
        setUser({ name, email: session.user.email || "", initials });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email || "Member";
        const parts = name.split(" ");
        const initials = parts.length >= 2
          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
          : name.slice(0, 2).toUpperCase();
        setUser({ name, email: session.user.email || "", initials });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile + profile menu on route change
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfileOpen(false);
    router.push("/");
    router.refresh();
  };

  // Base nav links (always shown)
  const baseLinks = [
    { href: "/",           label: "Home" },
    { href: "/store",      label: "Store" },
    { href: "/track-order",label: "Track Order" },
  ];

  // Extra links when logged in
  const authLinks = [
    { href: "/account",           label: "Order History" },
    { href: "/account?tab=profile", label: "Profile" },
  ];

  const allLinks = user ? [...baseLinks, ...authLinks] : baseLinks;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[300] transition-all duration-500 ${
          scrolled
            ? "bg-[#050505]/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-black tracking-[0.3em] uppercase text-white hover:text-white/70 transition-colors"
          >
            MONVRE
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {baseLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                prefetch={true}
                className={`text-xs tracking-[0.2em] uppercase transition-colors ${
                  pathname === l.href ? "text-white" : "text-white/50 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}

            {/* Logged-in extra links */}
            {user && (
              <>
                <Link
                  href="/account"
                  prefetch={true}
                  className={`text-xs tracking-[0.2em] uppercase transition-colors ${
                    pathname === "/account" ? "text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  Orders
                </Link>
              </>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <button
              id="cart-toggle"
              onClick={openCart}
              className="relative text-white/70 hover:text-white transition-colors"
              aria-label="Open cart"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Profile avatar (logged in) OR Account link (logged out) */}
            {user ? (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="w-8 h-8 rounded-full bg-white text-black text-[10px] font-black tracking-widest flex items-center justify-center hover:bg-white/90 transition-colors"
                  aria-label="Profile menu"
                >
                  {user.initials}
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-52 bg-[#0a0a0a] border border-white/10 shadow-2xl shadow-black/50 z-50"
                    >
                      {/* User info header */}
                      <div className="px-4 py-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white text-black text-[11px] font-black flex items-center justify-center flex-shrink-0">
                            {user.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white/90 truncate">{user.name}</p>
                            <p className="text-[9px] text-white/30 tracking-wide truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="text-[9px] tracking-[0.2em] uppercase text-amber-400/80 font-bold">Verified Member</span>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="py-2">
                        {[
                          { href: "/account",             label: "Order History",   icon: "◈" },
                          { href: "/account?tab=profile", label: "My Profile",      icon: "◎" },
                          { href: "/track-order",         label: "Track Order",     icon: "△" },
                          { href: "/store",               label: "Shop Now",        icon: "◇" },
                        ].map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-white/50 hover:text-white hover:bg-white/[0.04] transition-all"
                          >
                            <span className="text-white/20 w-3 text-center text-sm">{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-white/5 py-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500/60 hover:text-red-400 hover:bg-red-500/5 transition-all"
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
                className="hidden md:block text-xs tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors"
              >
                Account
              </Link>
            )}

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden text-white/70 hover:text-white"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-[#050505] pt-20 px-6 flex flex-col gap-6 md:hidden overflow-y-auto pb-10"
          >
            {allLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-3xl font-black tracking-tighter text-white/90 uppercase"
              >
                {l.label}
              </Link>
            ))}

            <div className="border-t border-white/10 pt-6 flex flex-col gap-4 mt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white text-black font-black text-sm flex items-center justify-center">
                      {user.initials}
                    </div>
                    <div>
                      <p className="text-sm text-white/80 font-semibold">{user.name}</p>
                      <p className="text-[10px] text-white/30">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-red-500/60 tracking-widest uppercase text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm text-white/60 tracking-widest uppercase">Login</Link>
                  <Link href="/auth/signup" className="text-sm text-white/60 tracking-widest uppercase">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
