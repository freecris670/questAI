"use client";

import Link from 'next/link';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';

export default function NotFound() {
  return (
    <>
      <MainHeader />
      <main className="flex flex-col items-center justify-center min-h-screen px-4 pt-[120px] pb-[80px]">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-6xl font-bold text-quest-blue mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Страница не найдена
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Извините, запрашиваемая страница не существует или была перемещена.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-quest-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </main>
      <MainFooter />
    </>
  );
}
