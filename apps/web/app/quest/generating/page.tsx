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
  const [generationId, setGenerationId] = useState<string>("");
  
  const generateQuest = useGenerateQuest();

  useEffect(() => {
    // Функция для проверки, был ли уже запущен процесс генерации
    const checkIfGenerationStarted = () => {
      // Создаем уникальный идентификатор для текущего запроса генерации
      const requestId = `generation_${description.substring(0, 20).replace(/\s+/g, '_')}_${Date.now()}`;
      
      // Проверяем, был ли уже запущен процесс генерации с таким же описанием
      const inProgressId = localStorage.getItem('quest_generation_in_progress');
      
      // Если процесс уже запущен и это не текущий запрос - прерываем
      if (inProgressId && inProgressId !== requestId) {
        console.warn('Процесс генерации уже запущен с ID:', inProgressId);
        return { alreadyStarted: true, requestId };
      }
      
      // Записываем текущий ID генерации
      localStorage.setItem('quest_generation_in_progress', requestId);
      setGenerationId(requestId);
      return { alreadyStarted: false, requestId };
    };
    
    // Запускаем генерацию квеста при загрузке страницы
    const generationStartedRef = { current: false };
    
    const startGeneration = async () => {
      // Предотвращаем повторный запуск в одном и том же рендере
      if (!description || isGenerating || generationStartedRef.current) return;
      
      // Помечаем, что генерация запущена для текущего рендера
      generationStartedRef.current = true;
      
      // Проверяем, не запущен ли уже процесс генерации
      const { alreadyStarted, requestId } = checkIfGenerationStarted();
      if (alreadyStarted) {
        console.warn('Пропускаем повторный запуск генерации квеста');
        return;
      }
      
      setIsGenerating(true);
      
      // Устанавливаем таймаут для предотвращения зависания
      const timeoutId = setTimeout(() => {
        console.error('Превышено время ожидания генерации квеста (60 секунд)');
        setIsGenerating(false);
        localStorage.removeItem('quest_generation_in_progress');
        router.push('/?error=generation_timeout');
      }, 60000); // 60 секунд таймаут
      
      try {
        console.warn('Начинаем генерацию квеста с описанием:', description);
        
        // Проверяем длину описания
        if (description.length > 1500) {
          console.warn('Слишком длинное описание квеста:', description.length, 'символов');
          clearTimeout(timeoutId);
          setIsGenerating(false);
          router.push('/?error=description_too_long');
          return;
        }
        
        // Определяем сложность на основе описания (простая логика)
        let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
        const lowerDesc = description.toLowerCase();
        if (lowerDesc.includes('легк') || lowerDesc.includes('прост') || lowerDesc.includes('начина')) {
          difficulty = 'easy';
        } else if (lowerDesc.includes('сложн') || lowerDesc.includes('труд') || lowerDesc.includes('эксперт')) {
          difficulty = 'hard';
        }
        
        console.warn('Определена сложность квеста:', difficulty);
        
        // Готовим параметры для запроса
        const requestParams = {
          theme: description,
          difficulty,
          additionalDetails: description,
          // Добавляем обязательные поля, которые ожидает бэкенд
          length: 'medium' as 'short' | 'medium' | 'long', // Добавляем поле длины квеста (short, medium, long)
          userId: user?.id || 'anonymous', // Добавляем ID пользователя или anonymous для неавторизованных
          isTrial: !user // Если пользователь не авторизован, используем пробный режим
        };
        
        console.warn('Отправляем запрос на генерацию с параметрами:', requestParams);
        
        // Генерируем квест (используем пробный режим для неавторизованных)
        const questData = await generateQuest.mutateAsync(requestParams);
        
        // Очищаем таймаут после получения ответа
        clearTimeout(timeoutId);
        
        // Очищаем статус генерации в localStorage
        localStorage.removeItem('quest_generation_in_progress');
        
        console.warn('Получены данные квеста:', questData);
        
        // Если это пробный квест, сохраняем его в localStorage
        if (!user && questData && questData.id && questData.id.startsWith('trial_')) {
          localStorage.setItem(`quest_${questData.id}`, JSON.stringify(questData));
          console.warn('Сохранен пробный квест в localStorage:', questData.id);
        }
        
        // После успешной генерации перенаправляем на страницу квеста
        if (questData && questData.id) {
          // Перенаправляем на страницу квеста
          router.push(`/quest/${questData.id}`);
          console.warn('Перенаправление на страницу квеста:', `/quest/${questData.id}`);
        } else {
          console.error('Не удалось получить ID квеста');
          router.push('/?error=generation_failed');
        }
      } catch (error) {
        // Очищаем таймаут в случае ошибки
        clearTimeout(timeoutId);
        
        // Очищаем статус генерации в localStorage
        localStorage.removeItem('quest_generation_in_progress');
        
        // Улучшенная обработка ошибок
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Ошибка при генерации квеста:', errorMessage);
        
        // Анализируем ошибку для более точного сообщения пользователю
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          console.error('Ошибка авторизации при генерации квеста');
          router.push('/?error=authorization_failed');
        } else if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
          console.error('Превышено время ожидания ответа от сервера');
          router.push('/?error=server_timeout');
        } else {
          router.push('/?error=generation_failed');
        }
        
        setIsGenerating(false);
      }
    };
    
    startGeneration();
    
    // Функция очистки для useEffect
    return () => {
      generationStartedRef.current = true; // Предотвращаем запуск после размонтирования
    };
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
  
  // Очищаем статус генерации при размонтировании компонента
  useEffect(() => {
    return () => {
      if (generationId) {
        const currentId = localStorage.getItem('quest_generation_in_progress');
        if (currentId === generationId) {
          localStorage.removeItem('quest_generation_in_progress');
        }
      }
    };
  }, [generationId]);

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
