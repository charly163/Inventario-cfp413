/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Forzar el modo standalone para producción
  output: 'standalone',
  // Mejorar la compatibilidad
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
      '@/src': path.join(__dirname, 'src'),
      '@/lib': path.join(__dirname, 'lib'),
    };
    return config;
  },
};

module.exports = nextConfig;
