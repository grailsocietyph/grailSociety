import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.grailsocietyph.com",
      },
      {
        protocol: "https",
        hostname: "grailsocietyph.com",
      },
      {
        protocol: "https",
        hostname: "**.grailsocietyph.com",
      },
      {
        protocol: "https",
        hostname: "pub-abb39c535f0f43aa9d52a4a235edb52a.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
