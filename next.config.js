const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence the "multiple lockfiles" workspace root warning
  outputFileTracingRoot: path.join(__dirname),

  // Hide the floating Next.js dev-mode indicator
  devIndicators: false,
  // Allow network access without CORS warning
  allowedDevOrigins: ['10.0.204.156', 'localhost:3000', 'localhost:3001', 'localhost:3002'],

  // ── Image optimisation ─────────────────────────────────────────────
  // Serve WebP/AVIF instead of JPEG/PNG — typically 40-60% smaller files.
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    // Add external image domains here if needed (e.g. Cloudinary, Neon CDN)
    remotePatterns: [],
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
