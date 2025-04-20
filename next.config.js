/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Simplify experimental features - remove problematic options
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'bcryptjs', 'mongodb'],
  },
  compiler: {
    styledComponents: true
  },
  // Simplify headers
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Fix for mongoose import issues
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        mongoose: false, // This prevents client-side mongoose import
        mongodb: false,
        bcryptjs: false,
      };
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        util: false,
      };
    }
    
    return config;
  }
};

module.exports = nextConfig; 