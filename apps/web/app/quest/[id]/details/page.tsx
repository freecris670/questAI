"use client";

import { useParams, useRouter } from 'next/navigation';
import { useQuest } from '@/lib/hooks/useQuests';
import { useAuth } from '@/lib/hooks/useAuth';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Award, Clock, Target, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function QuestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const questId = params.id as string;
  
  // Проверяем, является ли это пробным квестом
  const isTrialQuest = questId.startsWith('trial_');
  const [trialQuestData, setTrialQuestData] = useState<any>(null);
  
  // Используем хук только для обычных квестов
  const { data: quest, isLoading, error } = useQuest(isTrialQuest ? '' : questId);

  useEffect(() => {
    // Для пробных квестов загружаем данные из localStorage
    if (isTrialQuest) {
      const storedQuest = localStorage.getItem(`quest_${questId}`);
      if (storedQuest) {
        setTrialQuestData(JSON.parse(storedQuest));
      }
    }
  }, [questId, isTrialQuest]);

  // Определяем данные для отображения
  const displayQuest = isTrialQuest ? trialQuestData : quest;
  const loading = isTrialQuest ? !trialQuestData : isLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner className="w-12 h-12 text-blue-600" />
      </div>
    );
  }

  if ((error || !displayQuest) && !isTrialQuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {error ? 'Ошибка загрузки квеста' : 'Квест не найден'}
          </h2>
          <Button onClick={() => router.push('/')} variant="outline">
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  if (isTrialQuest && !displayQuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Пробный квест не найден
          </h2>
          <p className="text-gray-600 mb-4">
            Возможно, квест был создан в другом браузере или данные были очищены.
          </p>
          <Button onClick={() => router.push('/')} variant="outline">
            Создать новый квест
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col">
      <MainHeader />
      
      <main className="flex-grow container mx-auto max-w-[1200px] px-5 py-5 md:py-10 mt-20">
        {/* Заголовок квеста */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          {isTrialQuest && !user && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-amber-800 text-sm">
                Это пробный квест. Чтобы сохранить его и получить доступ ко всем функциям, 
                <Button 
                  variant="link" 
                  className="text-amber-800 underline p-0 h-auto ml-1"
                  onClick={() => router.push('/auth')}
                >
                  зарегистрируйтесь
                </Button>
              </p>
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold text-[#2553A1] mb-4">
            {displayQuest.title}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {displayQuest.description}
          </p>
          
          {/* Статистика квеста */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>{displayQuest.estimatedTime || '30 мин'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Award className="w-5 h-5" />
              <span>{displayQuest.totalXp || 100} XP</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Target className="w-5 h-5" />
              <span>{displayQuest.tasks?.length || 0} заданий</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span>{displayQuest.participantsCount || 0} участников</span>
            </div>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 bg-[#22B07D] hover:bg-[#22B07D]/90 text-white"
              onClick={() => router.push(`/quest/${questId}`)}
            >
              Начать квест
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push(`/quest/${questId}/edit`)}
            >
              Редактировать
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // Логика для шеринга квеста
                navigator.clipboard.writeText(window.location.href);
                alert('Ссылка скопирована!');
              }}
            >
              Поделиться
            </Button>
          </div>
        </div>

        {/* Список заданий */}
        {displayQuest.tasks && displayQuest.tasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#2553A1] mb-6">
              Задания квеста
            </h2>
            <div className="space-y-4">
              {displayQuest.tasks.map((task: { id: string; title: string; description: string; xp: number; completed?: boolean }, index: number) => (
                <div 
                  key={task.id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#2553A1] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">
                        {index + 1}. {task.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {task.description}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center space-x-1 text-[#22B07D]">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-medium">{task.xp || 20} XP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <MainFooter />
    </div>
  );
}
