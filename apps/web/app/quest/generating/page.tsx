"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useGenerateQuest } from '@/lib/hooks/useQuests';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';

function QuestGeneratingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const generateQuest = useGenerateQuest();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    'Анализируем магическую сущность вашего запроса...',
    'Кузнец квестов выковывает уникальные испытания...',
    'Картограф рисует путь вашего приключения...',
    'Добавляем редкие награды и артефакты...',
    'Финальная проверка свитка приключений...'
  ];

  useEffect(() => {
    const generateQuestFromParams = async () => {
      if (isGenerating) return;
      
      const description = searchParams.get('description');
      const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard';
      
      if (!description) {
        router.push('/');
        return;
      }

      setIsGenerating(true);
      
      // Анимация шагов
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(stepInterval);
            return prev;
          }
        });
      }, 2000);

      // Таймаут для генерации (60 секунд)
      const timeoutId = setTimeout(() => {
        clearInterval(stepInterval);
        console.error('Превышено время ожидания генерации квеста (60 секунд)');
        setIsGenerating(false);
        router.push('/?error=timeout');
      }, 60000);

      try {
        // Определяем сложность на основе длины описания
        let finalDifficulty = difficulty || 'medium';
        if (!difficulty) {
          if (description.length < 50) {
            finalDifficulty = 'easy';
          } else if (description.length > 200) {
            finalDifficulty = 'hard';
            console.warn('Слишком длинное описание квеста:', description.length, 'символов');
          } else {
            finalDifficulty = 'medium';
          }
        }
        
        // Готовим параметры для запроса
        const requestParams = {
          theme: description,
          difficulty: finalDifficulty,
          length: 'medium' as const,
          userId: user?.id || 'anonymous' // Используем ID пользователя или 'anonymous'
        };
        
        // Генерируем квест
        const questData = await generateQuest.mutateAsync(requestParams);
        
        // Очищаем таймаут
        clearTimeout(timeoutId);
        
        // Завершаем анимацию
        clearInterval(stepInterval);
        setCurrentStep(steps.length - 1);
        
        // Перенаправляем на страницу квеста
        setTimeout(() => {
          router.push(`/quest/${questData.id}`);
        }, 500);
        
      } catch (error: unknown) {
        clearTimeout(timeoutId);
        console.error('Ошибка при генерации квеста:', error);
        setIsGenerating(false);
        
        // Обработка различных типов ошибок
        if (error instanceof Error && error.message.includes('лимит')) {
          router.push('/?error=limit_exceeded');
        } else {
          router.push('/?error=generation_failed');
        }
      }
    };

    generateQuestFromParams();
  }, [searchParams, router, generateQuest, user, isGenerating, steps.length]);

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col">
      <MainHeader />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="mb-8">
            <div className="w-16 h-16 border-4 border-[#2553A1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-semibold text-[#2553A1] mb-2">
              Создаем ваш квест
            </h1>
            <p className="text-gray-600 mb-6">
              Это может занять несколько минут...
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                  index <= currentStep 
                    ? 'bg-[#2553A1]/10 text-[#2553A1]' 
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                  index < currentStep 
                    ? 'bg-[#2553A1] text-white' 
                    : index === currentStep
                    ? 'bg-[#2553A1] text-white animate-pulse'
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-sm text-gray-500">
            Не закрывайте эту страницу до завершения генерации
          </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}

export default function QuestGeneratingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F9FB] flex flex-col">
        <MainHeader />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
            <div className="w-16 h-16 border-4 border-[#2553A1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-semibold text-[#2553A1] mb-2">
              Подготовка генерации
            </h1>
            <p className="text-gray-600">
              Загружаем параметры квеста...
            </p>
          </div>
        </main>
        <MainFooter />
      </div>
    }>
      <QuestGeneratingContent />
    </Suspense>
  );
}
