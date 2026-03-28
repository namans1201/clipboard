import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
};

export default nextConfig;
