/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // This is experimental but can be used if continuing to have problems
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },
  webpack: (config) => {
    // Custom webpack config if needed
    return config;
  }
};

module.exports = nextConfig; 