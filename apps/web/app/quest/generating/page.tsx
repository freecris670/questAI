"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGenerateQuest } from '@/lib/hooks/useQuests';
import { Spinner } from '@/components/ui/spinner';

// Советы, которые показываются во время генерации
const generationHints = [
  "Анализируем ваш запрос и создаем уникальный сценарий...",
  "Разрабатываем интересные задания и испытания...",
  "Добавляем элементы геймификации и награды...",
  "Настраиваем сложность и баланс квеста...",
  "Финальная проверка и оптимизация..."
];

export default function GeneratingQuestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const description = searchParams.get('description') || '';
  
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateQuest = useGenerateQuest();

  useEffect(() => {
    // Запускаем генерацию квеста при загрузке страницы
    const startGeneration = async () => {
      if (!description || isGenerating) return;
      
      setIsGenerating(true);
      
      try {
        // Определяем сложность на основе описания (простая логика)
        let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
        const lowerDesc = description.toLowerCase();
        if (lowerDesc.includes('легк') || lowerDesc.includes('прост') || lowerDesc.includes('начина')) {
          difficulty = 'easy';
        } else if (lowerDesc.includes('сложн') || lowerDesc.includes('труд') || lowerDesc.includes('эксперт')) {
          difficulty = 'hard';
        }
        
        // Генерируем квест
        const questData = await generateQuest.mutateAsync({
          theme: description,
          difficulty,
          additionalDetails: description
        });
        
        // Переходим на страницу с результатом
        if (questData && questData.id) {
          router.push(`/quest/${questData.id}/details`);
        } else {
          throw new Error('Не удалось получить ID квеста');
        }
      } catch (error) {
        console.error('Ошибка при генерации квеста:', error);
        // Возвращаем на главную с сообщением об ошибке
        router.push('/?error=generation_failed');
      }
    };
    
    startGeneration();
  }, [description, generateQuest, router, isGenerating]);

  // Меняем подсказки каждые 3 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHintIndex((prevIndex) => 
        prevIndex < generationHints.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!description) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Описание квеста не указано</h2>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          <div className="mb-8">
            <Spinner className="w-16 h-16 mx-auto text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Создаем ваш квест
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {generationHints[currentHintIndex]}
          </p>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Ваше описание:</h3>
            <p className="text-gray-700 italic">"{description}"</p>
          </div>
          
          <div className="flex justify-center space-x-2">
            {generationHints.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                  index <= currentHintIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
