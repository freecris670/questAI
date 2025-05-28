"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play as PlayIcon, 
  Share2 as Share2Icon, 
  Check as CheckIcon,
  Pencil as PencilIcon 
} from 'lucide-react';
import { QuestStage } from '../types';

interface QuestHeaderProps {
  title: string;
  questType: string;
  createdDays: number;
  description: string;
  progress: number;
  stages: QuestStage[];
}

export function QuestHeader({ 
  title, 
  questType, 
  createdDays, 
  description, 
  progress, 
  stages 
}: QuestHeaderProps) {
  // Функция для генерации случайного изображения квеста на основе названия
  const getQuestImage = (title: string) => {
    // В реальном приложении здесь будет логика выбора изображения на основе темы квеста
    // или получение URL изображения из API
    const imageId = Math.floor((title.length + 10) % 20) + 10; 
    return `https://picsum.photos/seed/quest${imageId}/300/200`;
  };
  
  const questImage = getQuestImage(title);
  
  return (
    <Card className="mb-6 bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        {/* Шапка квеста с изображением и информацией */}
        <div className="flex flex-col md:flex-row gap-5 mb-6">
          {/* Изображение квеста */}
          <div className="md:w-1/4 min-w-[150px]">
            <div className="h-[150px] md:h-[180px] w-full rounded-lg overflow-hidden">
              <img 
                src={questImage} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Информация о квесте */}
          <div className="md:w-3/4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h1>
            
            <div className="flex items-center mb-3 flex-wrap gap-y-2">
              <Badge variant="outline" className="mr-2 border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400">
                {questType}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Создан {createdDays} дней назад
              </span>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>
          </div>
        </div>
        
        {/* Прогресс квеста с чекпоинтами - новый вариант */}
        <div className="mb-6">
          <div className="flex justify-end mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
          </div>
          
          {/* Прогресс-бар с интегрированными чекпоинтами */}
          <div className="mb-2 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative">
            {/* Индикатор прогресса */}
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-in-out absolute top-0 left-0" 
              style={{ width: `${progress}%` }}
            />
            
            {/* Чекпоинты внутри полосы прогресса */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-2">
              {stages.map((stage, index) => {
                // Рассчитываем позицию чекпоинта
                const position = index / (stages.length - 1);
                const isCompleted = position * 100 <= progress;
                
                return (
                  <div key={index} className="relative flex flex-col items-center z-10">
                    {/* Чекпоинт */}
                    <div 
                      className={`w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center
                        ${isCompleted ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      {stage.completed ? (
                        <CheckIcon size={12} className="text-white" />
                      ) : (
                        <span className="text-xs font-medium text-white">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Название этапа */}
                    <div className="absolute top-8 transform -translate-x-1/2 left-1/2">
                      <span className="text-xs whitespace-nowrap font-medium text-gray-600 dark:text-gray-400 text-center block">
                        {stage.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Дополнительное пространство для названий этапов */}
          <div className="h-6"></div>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex space-x-3">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
            <PlayIcon size={18} className="mr-2" /> Продолжить
          </Button>
          <Button variant="outline" className="flex-1 border-gray-300 dark:border-gray-600">
            <Share2Icon size={18} className="mr-2" /> Поделиться
          </Button>
          <Button variant="outline" className="flex-1 border-gray-300 dark:border-gray-600">
            <PencilIcon size={18} className="mr-2" /> Изменить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
