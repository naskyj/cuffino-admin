import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to complete even with ESLint warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't ignore TypeScript errors - these are critical
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
