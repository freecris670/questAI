/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@questai/ui"],
  // Необходимо для правильной работы с Netlify
  output: 'standalone',
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Для поддержки развертывания на Netlify
      {
        protocol: 'https',
        hostname: '*.netlify.app',
      },
    ],
  },
  experimental: {
    serverActions: {
      // Разрешаем домены Netlify
      allowedOrigins: ["localhost:3000", "*.netlify.app"],
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
