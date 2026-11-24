/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server in .next/standalone for a slim Docker runtime image
  output: "standalone",
  // scripts/development.mjs sets this so the local-API production build doesn't overwrite .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Bypass optimizer to avoid 500s when fetching from LAN/remote hosts
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.100.223",
        port: "5001",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "192.168.100.242",
        port: "5001",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.naturacarebd.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
