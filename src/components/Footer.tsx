"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const cols = [
  {
    title: "Shop",
    links: [
      { label: "Tops", href: "/store" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/auth/login" },
      { label: "Sign Up", href: "/auth/signup" },
      { label: "My Account", href: "/account" },
      { label: "Track Order", href: "/track-order" },
    ],
  },
  {
    title: "Info",
    links: [
      { label: "About MONVRE", href: "/about" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Returns", href: "/returns" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="bg-[#050505] border-t border-white/5 mt-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="text-lg font-black tracking-[0.3em] uppercase mb-4">MONVRE</p>
            <p className="text-xs text-white/40 leading-relaxed max-w-xs">
              Premium tech-garment streetwear. Engineered for the urban void.
            </p>
          </div>

          {/* Links */}
          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-5">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      prefetch={true}
                      className="text-xs text-white/50 hover:text-white transition-colors tracking-wide"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-white tracking-widest uppercase">
            © {new Date().getFullYear()} MONVRE. All rights reserved.
          </p>
          <p className="text-[10px] text-white tracking-widest uppercase">
            Series 01 Limited Drop
          </p>
        </div>
      </div>
    </footer>
  );
}
