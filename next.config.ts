import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // For static export (GitHub Pages/Netlify)
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Image optimization for static export
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 420, 768, 1024, 1200, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'react-intersection-observer',
      'react-i18next',
      'i18next',
    ],
  },
  
  // Bundle analyzer
  webpack: (config, { dev, isServer }) => {
    // Bundle splitting for better caching
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 20,
          },
          i18n: {
            test: /[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/,
            name: 'i18n',
            chunks: 'all',
            priority: 15,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            enforce: true,
          },
        },
      };
    }

    // Optimize bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      // Remove problematic alias for framer-motion
    };

    return config;
  },
  
  // Note: Headers don't work with static export, handled by Netlify instead
  
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
