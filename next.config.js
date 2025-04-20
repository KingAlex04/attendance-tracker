/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Only include compatible experimental features
    serverActions: true,
  },
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },
  webpack: (config, { isServer }) => {
    // Fix for mongoose import issues
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        mongoose: false, // This prevents client-side mongoose import
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