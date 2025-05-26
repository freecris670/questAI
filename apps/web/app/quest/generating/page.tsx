"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { loadSampleQuestData } from '@/lib/services/questData';

const GeneratingQuestPage = () => {
  const router = useRouter();
  const hints = [
    "Анализируем вашу задачу...",
    "Генерируем увлекательный сюжет...",
    "Добавляем элементы геймификации...",
    "Настраиваем сложность и награды...",
  ];
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const hintInterval = setInterval(() => {
      setCurrentHintIndex((prevIndex) => (prevIndex + 1) % hints.length);
    }, 3000);

    const totalDuration = 3000; // ms (3 seconds for auto-redirect example)
    const updateInterval = 100; // ms
    const progressIncrement = (100 / (totalDuration / updateInterval));

    const progressTimer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(progressTimer);
          
          // Получаем данные из JSON-файла
          const questData = loadSampleQuestData();
          // Генерируем уникальный ID для квеста
          const randomId = `quest-${Math.random().toString(36).substring(2, 10)}`;
          
          // Перенаправление на страницу с детальным описанием квеста
          router.push(`/quest/${randomId}`);
          return 100;
        }
        return prevProgress + progressIncrement;
      });
    }, updateInterval);

    return () => {
      clearInterval(hintInterval);
      clearInterval(progressTimer);
    };
  }, [hints.length, router]);

  return (
    <div className="min-h-screen bg-quest-bg-light flex flex-col">
      <MainHeader />
      {/* Main content area with padding for fixed header and flex-grow to push footer down */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 text-center pt-20">
        <div className="relative w-[120px] h-[120px] mb-8">
          <div 
            className="absolute inset-0 rounded-full animate-spin-slow border-[6px] border-transparent border-t-quest-blue border-r-quest-emerald"
            style={{ animationDuration: '2s' }}
          />
          <div 
            className="absolute inset-0 rounded-full animate-spin-slow-reverse border-[6px] border-transparent border-l-quest-blue border-b-quest-emerald"
            style={{ animationDuration: '2s', animationDelay: '-1s' }}
          />
          <div className="w-full h-full flex items-center justify-center">
            <Brain size={48} className="text-quest-blue" />
          </div>
        </div>

        <div className="w-[300px] h-[6px] bg-quest-gray-border rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-quest-blue to-quest-emerald rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h1 className="text-2xl font-medium text-quest-blue mb-3 text-center">
          Создаем ваш квест...
        </h1>
        <p className="text-base text-[#64748B] min-h-[24px] text-center">
          {hints[currentHintIndex]}
        </p>

        <button 
          onClick={() => {
            console.log('Cancel generation');
            router.push('/'); // Navigate to main page
          }}
          className="mt-12 text-quest-cancel-red hover:underline text-sm"
        >
          Отменить
        </button>
      </div>
      <MainFooter />
    </div>
  );
};

export default GeneratingQuestPage;
