'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGeneratedQuest } from '@/lib/hooks/useGeneratedQuest';
import GeneratedQuestDisplay from '@/components/quests/GeneratedQuestDisplay';
import { Loader2 } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';

export default function CreateQuestPage() {
  const [isGenerating, setIsGenerating] = useState(true);
  
  // Используем хук для работы с генерацией квеста
  const {
    questData,
    isLoading,
    error,
    generateNewQuest,
    startQuest,
    shareQuest
  } = useGeneratedQuest({
    // Колбэки для обработки действий с квестом
    onStartCallback: (quest) => {
      alert(`Квест "${quest.title}" запущен!`);
    },
    onShareCallback: (quest) => {
      alert(`Функция шеринга для квеста "${quest.title}" будет доступна в ближайшее время!`);
    }
  });

  // Обработчик для генерации квеста
  const handleGenerateQuest = () => {
    generateNewQuest();
    setIsGenerating(false);
  };

  // Обработчик для возврата к экрану генерации
  const handleBackToGeneration = () => {
    setIsGenerating(true);
  };

  // Если отображаем экран генерации квеста
  if (isGenerating) {
    return (
      <>
        <MainHeader />
        <div className="container mx-auto p-4 md:p-8 max-w-4xl mt-[80px] mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Создание нового квеста
          </h1>
        
        <Card className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
              Параметры генерации
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Здесь будут параметры для генерации квеста */}
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Нажмите кнопку ниже, чтобы сгенерировать квест с случайными параметрами.
                В реальном приложении здесь будут настройки для более точной генерации.
              </p>
              
              <div className="flex justify-center pt-4">
                <Button 
                  size="lg" 
                  onClick={handleGenerateQuest}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-md"
                >
                  Сгенерировать квест
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <MainFooter />
    </>
    );
  }

  // Если квест генерируется, показываем индикатор загрузки
  if (isLoading) {
    return (
      <>
        <MainHeader />
        <div className="flex justify-center items-center min-h-screen mt-[80px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-gray-700 dark:text-gray-300">Генерация квеста...</p>
          </div>
        </div>
        <MainFooter />
      </>
    );
  }

  // Если произошла ошибка
  if (error) {
    return (
      <>
        <MainHeader />
        <div className="container mx-auto p-4 md:p-8 max-w-4xl mt-[80px] mb-8">
          <Card className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow-xl rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
                Произошла ошибка при генерации квеста
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {error.message}
              </p>
              <Button 
                variant="outline" 
                onClick={handleBackToGeneration}
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Вернуться к генерации
              </Button>
            </CardContent>
          </Card>
        </div>
        <MainFooter />
      </>
    );
  }

  // Если квест успешно сгенерирован, показываем компонент GeneratedQuestDisplay
  if (questData) {
    return (
      <>
        <MainHeader />
        <div className="container mx-auto px-4 py-2 max-w-4xl mt-[80px]">
          <Button 
            variant="ghost" 
            onClick={handleBackToGeneration}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            ← Вернуться к генерации
          </Button>
        </div>
        
        <GeneratedQuestDisplay 
          questData={questData}
          onStartQuest={startQuest}
          onGenerateNew={generateNewQuest}
          onShare={shareQuest}
        />
        <MainFooter />
      </>
    );
  }

  // Запасной вариант, если ни одно из условий не выполнено
  return (
    <>
      <MainHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-4xl mt-[80px] mb-8">
        <Card className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <CardContent className="p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Что-то пошло не так. Пожалуйста, попробуйте снова.
            </p>
            <Button onClick={handleBackToGeneration}>
              Вернуться к генерации
            </Button>
          </CardContent>
        </Card>
      </div>
      <MainFooter />
    </>
  );
}
