/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to enable API routes and server-side rendering
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  trailingSlash: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // LCP and TTFB optimizations
  reactStrictMode: false, // Reduce development overhead
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', '@radix-ui/react-accordion', '@radix-ui/react-tabs'],
  },
  // Modern browser optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: false,
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  // Modern JavaScript optimizations (SWC minifier is enabled by default in Next.js 15+)
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
      preventFullImport: true,
    },
  },
  // Advanced bundling optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting for better performance
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        cacheGroups: {
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix',
            priority: 15,
            chunks: 'all',
          },
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            priority: 15,
            chunks: 'all',
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 10,
            chunks: 'all',
            minSize: 20000,
            maxSize: 100000,
          },
        },
      };
    }
    return config;
  },
  // Headers are not supported with output: 'export' - removing for static deployment
}

export default nextConfig