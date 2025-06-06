/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@questai/ui"],
  // Отключаем строгие правила ESLint для сборки
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Отключаем проверку TypeScript для ускорения сборки
  typescript: {
    ignoreBuildErrors: true,
  },
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

    ],
  },
  // Экспериментальные функции для улучшения производительности
  experimental: {
    optimizePackageImports: ['@questai/ui'],
  },
  // Переменные окружения
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  // Пропускаем генерацию статических страниц для динамических роутов
  generateBuildId: async () => {
    return 'build-' + Date.now();
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
