/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Fix chunk loading in development
    if (!isServer && dev) {
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    
    return config;
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-hot-toast'],
  },

  // Production optimizations
  productionBrowserSourceMaps: false,
  
  // Faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
