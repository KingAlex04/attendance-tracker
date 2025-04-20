/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Minimal experimental features needed
    serverComponentsExternalPackages: ['mongoose', 'bcryptjs', 'mongodb'],
    // Using more stable options
    serverActions: {
      allowedOrigins: ['localhost:3000', 'attendance-tracker.vercel.app'],
    },
  },
  compiler: {
    styledComponents: true
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