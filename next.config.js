const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Habilitar PWA em dev com variável de ambiente
  disable: process.env.NODE_ENV === 'development' && !process.env.ENABLE_PWA_DEV,
  // Usar service worker otimizado
  sw: 'sw-optimized.js',
  // Configurações de Workbox
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // Habilitar features modernas
  navigationPreload: true,
  
  // Runtime caching configurações (Workbox gerencia automaticamente)
  workboxOptions: {
    disableDevLogs: true,
    navigateFallback: '/',
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true,
    maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
  },
  
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 86400 // 24 horas
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      urlPattern: /\.(?:js|css|html|png|jpg|jpeg|svg|woff|woff2|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 604800 // 7 dias
        }
      }
    },
    {
      urlPattern: /^https?:\/\/.*\/api\/products.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'products-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 3600 // 1 hora
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Turbopack instead of Webpack (faster builds)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.react.js',
      },
    },
  },
  reactCompiler: true,

  // ================================================================
  // SECURITY & CACHE HEADERS - COMPLETE CONFIGURATION
  // ================================================================
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self), payment=(self)'
      }
    ];

    return [
      // ============================================================
      // GLOBAL SECURITY HEADERS (All routes)
      // ============================================================
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      
      // ============================================================
      // API ROUTES - CORS & Security
      // ============================================================
      {
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? 'https://app.stockpro.co.mz'
              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, x-user-id, x-user-email, x-user-role',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, private'
          },
        ],
      },

      // ============================================================
      // SERVICE WORKER - Critical for PWA
      // ============================================================
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },

      // ============================================================
      // MANIFEST.JSON - PWA Configuration
      // ============================================================
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate', // 24 hours
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },

      // ============================================================
      // NEXT.JS STATIC ASSETS - Long-term caching
      // ============================================================
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year
          },
        ],
      },

      // ============================================================
      // PUBLIC IMAGES & ICONS - Medium-term caching
      // ============================================================
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, immutable', // 30 days
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },

      // ============================================================
      // FAVICON & APPLE TOUCH ICONS
      // ============================================================
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000', // 30 days
          },
          {
            key: 'Content-Type',
            value: 'image/x-icon',
          },
        ],
      },
      {
        source: '/favicon.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000', // 30 days
          },
          {
            key: 'Content-Type',
            value: 'image/svg+xml',
          },
        ],
      },
      {
        source: '/apple-touch-icon:size*.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000', // 30 days
          },
        ],
      },

      // ============================================================
      // OFFLINE PAGE - Must be cached
      // ============================================================
      {
        source: '/offline.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, must-revalidate', // 7 days
          },
        ],
      },

      // ============================================================
      // STATIC IMAGES - Medium-term caching
      // ============================================================
      {
        source: '/:path*.{jpg,jpeg,png,gif,webp,avif,svg}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable', // 7 days
          },
        ],
      },

      // ============================================================
      // FONTS - Long-term caching
      // ============================================================
      {
        source: '/:path*.{woff,woff2,eot,ttf,otf}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'app.stockpro.co.mz',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  // Webpack configuration (CONSOLIDADO)
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'fs': false,
        'path': false,
      };
    }

    return config;
  },

  // Environment variables that should be available in the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Suppress middleware deprecation warning (using old but stable middleware)
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60, // 1 hour
    pagesBufferLength: 5,
  },
};

module.exports = withPWA(nextConfig);
