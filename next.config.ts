import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // For static export (GitHub Pages/Netlify)
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during builds for deployment
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
