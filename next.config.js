/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide the floating Next.js dev-mode indicator
  devIndicators: false,
  // Allow network access without CORS warning
  allowedDevOrigins: ["10.0.204.156", "localhost:3000", "localhost:3002"],

  // ── Image optimisation ─────────────────────────────────────────────
  // Serve WebP/AVIF instead of JPEG/PNG — typically 40-60% smaller files.
  images: {
    formats: ["image/avif", "image/webp"],
    // Cache optimised images for 1 year on the CDN
    minimumCacheTTL: 31536000,
    // External image domains (Supabase storage)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // ── HTTP Caching headers ────────────────────────────────────────────
  // Tell the browser/CDN to aggressively cache immutable build assets.
  async headers() {
    return [
      {
        // Next.js hashed static chunks — safe to cache forever
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Public images / fonts / videos — cache for 1 week
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff2|woff|mp4)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  // ── Compiler optimisations ──────────────────────────────────────────
  // Remove console.log statements in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
