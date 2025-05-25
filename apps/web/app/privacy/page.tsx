"use client";

import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';

export default function PrivacyPage() {
  return (
    <div className="bg-quest-bg-light min-h-screen text-gray-800 flex flex-col">
      <MainHeader />
      <main className="container mx-auto max-w-[1200px] px-5 py-10 my-5 flex-grow pt-20">
        <h1 className="text-3xl font-semibold text-quest-blue mb-6">Политика конфиденциальности</h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-lg text-gray-700">
            Содержимое страницы "Политика конфиденциальности" будет добавлено здесь.
          </p>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
