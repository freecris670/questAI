/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@questai/ui"],
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  webpack: (config) => {
    // Добавляем алиасы для Webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/styles': path.resolve(__dirname, './styles'),
      '@/types': path.resolve(__dirname, './types'),
    };
    return config;
  },
};

module.exports = nextConfig;
