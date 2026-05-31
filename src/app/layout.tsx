import type { Metadata } from "next";
import type { Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "AJ KITCHEN | Premium Ghanaian Cuisine in Columbus",
  description:
    "Authentic homemade Ghanaian and African meals in Columbus, Ohio. Pre-order Jollof, Waakye, and Kelewele for weekend delivery.",
  openGraph: {
    title: "AJ KITCHEN | Authentic Ghanaian Feast",
    description: "Defying gravity with authentic flavors. Pre-order weekdays, delivery weekends in Columbus, OH.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#db2777",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white text-pink-600 antialiased selection:bg-pink-100 selection:text-pink-700">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
