'use client';

import { useEffect, useState } from 'react';
import GeneratedQuestDisplay, { IGeneratedQuestData } from '@/components/quests/GeneratedQuestDisplay';
import { generateMockQuestData } from '@/lib/utils/mockQuestData';

export default function GeneratedQuestPage() {
  const [questData, setQuestData] = useState<IGeneratedQuestData | null>(null);

  // Генерация случайных данных при загрузке страницы
  useEffect(() => {
    setQuestData(generateMockQuestData());
  }, []);

  // Обработчики событий
  const handleStartQuest = () => {
    console.log('Начать квест:', questData?.title);
    // Здесь будет логика для начала квеста
    // Например, переход на страницу прохождения квеста
    alert('Квест начат!');
  };

  const handleGenerateNew = () => {
    // Генерация нового квеста
    setQuestData(generateMockQuestData());
  };

  const handleShare = () => {
    console.log('Поделиться квестом:', questData?.title);
    // Здесь будет логика для шеринга квеста
    alert('Функция шеринга будет доступна в ближайшее время!');
  };

  // Показываем загрузку, пока данные не сгенерированы
  if (!questData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <GeneratedQuestDisplay 
      questData={questData}
      onStartQuest={handleStartQuest}
      onGenerateNew={handleGenerateNew}
      onShare={handleShare}
    />
  );
}
