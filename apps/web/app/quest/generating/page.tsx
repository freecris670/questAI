"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGenerateQuest } from '@/lib/hooks/useQuests';
import { useAuth } from '@/lib/hooks/useAuth';
import { AnimatedRings } from '@/components/ui/animated-rings';
import { Progress } from '@/components/ui/progress';

// Улучшенные подсказки в стиле MMORPG
const generationHints = [
  "Анализируем магическую сущность вашего запроса...",
  "Кузнец квестов выковывает уникальные испытания...",
  "Картограф рисует путь вашего приключения...",
  "Добавляем редкие награды и артефакты...",
  "Балансируем сложность для идеального вызова...",
  "Наполняем квест эпической энергией...",
  "Финальная проверка свитка приключений..."
];

export default function GeneratingQuestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const description = searchParams.get('description') || '';
  const { user } = useAuth();
  
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [progress, setProgress] = useState(0);
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
        
        // Генерируем квест (используем пробный режим для неавторизованных)
        const questData = await generateQuest.mutateAsync({
          theme: description,
          difficulty,
          additionalDetails: description,
          // Добавляем обязательные поля, которые ожидает бэкенд
          length: 'medium', // Добавляем поле длины квеста (short, medium, long)
          userId: user?.id || 'anonymous', // Добавляем ID пользователя или anonymous для неавторизованных
          isTrial: !user // Если пользователь не авторизован, используем пробный режим
        });
        
        // Если это пробный квест, сохраняем его в localStorage
        if (!user && questData && questData.id && questData.id.startsWith('trial_')) {
          localStorage.setItem(`quest_${questData.id}`, JSON.stringify(questData));
        }
        
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
  }, [description, generateQuest, router, isGenerating, user]);

  // Анимация прогресс-бара
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  // Меняем подсказки каждые 2.5 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHintIndex((prevIndex) => 
        prevIndex < generationHints.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  if (!description) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Описание квеста не указано</h2>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#2553A1] text-white rounded-lg hover:bg-[#2553A1]/90 transition"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] via-[#E8F0FE] to-[#F0F9FF] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10">
          {/* Анимированные кольца */}
          <div className="flex justify-center mb-8">
            <AnimatedRings className="w-40 h-40" />
          </div>
          
          {/* Заголовок */}
          <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-[#2553A1] to-[#22B07D] bg-clip-text text-transparent mb-6">
            Создаем ваш квест
          </h1>
          
          {/* Текущая подсказка с плавной анимацией */}
          <div className="min-h-[60px] flex items-center justify-center mb-8">
            <p className="text-lg text-gray-700 text-center animate-fadeIn transition-all duration-500">
              {generationHints[currentHintIndex]}
            </p>
          </div>
          
          {/* Прогресс-бар */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Прогресс создания</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          
          {/* Описание квеста */}
          <div className="bg-gradient-to-r from-[#F7F9FB] to-[#E8F0FE] rounded-xl p-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Ваше задание:
            </h3>
            <p className="text-gray-800 italic leading-relaxed">
              "{description}"
            </p>
          </div>
          
          {/* Индикаторы этапов */}
          <div className="flex justify-center space-x-2 mt-8">
            {generationHints.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-500 ${
                  index <= currentHintIndex 
                    ? 'bg-gradient-to-r from-[#2553A1] to-[#22B07D] w-8' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Дополнительная информация */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Обычно генерация занимает 10-15 секунд
          </p>
        </div>
      </div>
    </div>
  );
}
