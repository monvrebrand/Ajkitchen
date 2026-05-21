/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide the floating Next.js dev-mode indicator (the "N" badge)
  devIndicators: false,
  // Allow network access without CORS warning
  allowedDevOrigins: ["10.0.204.156", "localhost:3000", "localhost:3002"],
};

module.exports = nextConfig;
