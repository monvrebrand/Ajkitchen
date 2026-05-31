"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";


const cols = [
  {
    title: "Menu",
    links: [
      { label: "Our Menu", href: "/store" },
      { label: "Track Meal", href: "/track-order" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/auth/login" },
      { label: "Sign Up", href: "/auth/signup" },
      { label: "My Account", href: "/account" },
    ],
  },
  {
    title: "Info",
    links: [
      { label: "About AJ KITCHEN", href: "/about" },
      { label: "Delivery Policy", href: "/shipping-policy" },
      { label: "Returns", href: "/returns" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-white border-t border-pink-100 relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-2 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-pink-100 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                <Image src="/logo.jpg" alt="AJ Kitchen" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <p className="text-sm font-black tracking-[0.25em] uppercase text-pink-600 group-hover:text-pink-700 transition-colors">
                AJ KITCHEN
              </p>
            </Link>
            <p className="text-[10px] text-pink-400 font-semibold leading-relaxed max-w-xs">
              Homemade Ghanaian cuisine in Columbus, Ohio.
            </p>
          </div>

          {/* Links */}
          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-[8px] tracking-[0.3em] uppercase text-pink-300 font-black mb-3">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      prefetch={true}
                      className="text-[11px] text-pink-500 hover:text-pink-700 transition-colors tracking-wide font-semibold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-pink-50 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[9px] text-pink-300 tracking-widest uppercase font-black">
            © {new Date().getFullYear()} AJ KITCHEN. All rights reserved.
          </p>
          <p className="text-[9px] text-pink-300 tracking-widest uppercase font-black">
            Columbus, Ohio • Weekend Deliveries
          </p>
        </div>
      </div>
    </footer>
  );
}
