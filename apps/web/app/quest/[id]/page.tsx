"use client";

import { useParams, useRouter } from 'next/navigation';
import { useQuest } from '@/lib/hooks/useQuests';
import { useAuth } from '@/lib/hooks/useAuth';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Progress } from '@/components/ui/progress';
import { Award, Clock, Target, Users, Sword, Shield, Gem, Star, Zap, Trophy, Scroll, Map, ChevronLeft as ChevronLeftIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Функция для определения иконки сложности
const getDifficultyIcon = (difficulty?: string) => {
  switch (difficulty) {
    case 'easy':
      return <Shield className="w-5 h-5 text-green-500" />;
    case 'medium':
      return <Sword className="w-5 h-5 text-yellow-500" />;
    case 'hard':
      return <Zap className="w-5 h-5 text-red-500" />;
    default:
      return <Star className="w-5 h-5 text-blue-500" />;
  }
};

// Функция для определения цвета сложности
const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'hard':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
};

export default function QuestPage() {
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
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <Spinner className="w-12 h-12 text-[#2553A1]" />
      </div>
    );
  }

  if ((error || !displayQuest) && !isTrialQuest) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
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

  // Расчет общего прогресса квеста
  const completedTasks = displayQuest.tasks?.filter((task: any) => task.completed).length || 0;
  const totalTasks = displayQuest.tasks?.length || 0;
  const questProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col">
      <MainHeader />
      
      <main className="flex-grow container mx-auto max-w-[1200px] px-5 py-5 md:py-10 mt-20">
        <div className="flex items-center mb-6">
          <Link href="/quests" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            <ChevronLeftIcon size={16} className="mr-1" /> 
            <span>Назад к квестам</span>
          </Link>
          <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            ID квеста: {questId}
          </div>
        </div>
        
        {/* Предупреждение для пробного квеста */}
        {isTrialQuest && !user && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-amber-600" />
              <p className="text-amber-800">
                Это пробный квест. Зарегистрируйтесь, чтобы сохранить прогресс и разблокировать все функции!
              </p>
            </div>
            <Button 
              variant="default" 
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => router.push('/auth')}
            >
              Регистрация
            </Button>
          </div>
        )}
        
        {/* Заголовок квеста с элементами MMORPG */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Баннер квеста */}
          <div className="bg-gradient-to-r from-[#2553A1] via-[#3B82F6] to-[#22B07D] h-32 relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 left-6 flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Map className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {displayQuest.title}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1",
                    getDifficultyColor(displayQuest.difficulty)
                  )}>
                    {getDifficultyIcon(displayQuest.difficulty)}
                    <span>{displayQuest.difficulty || 'Средний'} уровень</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Контент квеста */}
          <div className="p-6 md:p-8">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {displayQuest.description}
            </p>
            
            {/* Прогресс квеста */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Прогресс квеста</span>
                <span className="text-sm font-bold text-[#2553A1]">{Math.round(questProgress)}%</span>
              </div>
              <Progress value={questProgress} className="h-3" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {completedTasks} из {totalTasks} заданий выполнено
                </span>
                <span className="text-xs text-[#22B07D] font-medium">
                  +{displayQuest.totalXp || 100} XP
                </span>
              </div>
            </div>
            
            {/* Статистика квеста в стиле MMORPG */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 text-blue-700 mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Время</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{displayQuest.estimatedTime || '30 мин'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center space-x-2 text-emerald-700 mb-1">
                  <Gem className="w-5 h-5" />
                  <span className="font-medium">Награда</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">{displayQuest.totalXp || 100} XP</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-700 mb-1">
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Задания</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{displayQuest.tasks?.length || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center space-x-2 text-orange-700 mb-1">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Герои</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">{displayQuest.participantsCount || 0}</p>
              </div>
            </div>
            
            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1 bg-gradient-to-r from-[#22B07D] to-[#1FA268] hover:from-[#1FA268] hover:to-[#1C8F5A] text-white font-medium shadow-lg"
                onClick={() => router.push(`/quest/${questId}`)}
                size="lg"
              >
                <Sword className="w-5 h-5 mr-2" />
                Начать приключение
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-2"
                onClick={() => router.push(`/quest/${questId}/edit`)}
                size="lg"
              >
                <Scroll className="w-5 h-5 mr-2" />
                Редактировать квест
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // Логика для шеринга квеста
                  navigator.clipboard.writeText(window.location.href);
                  alert('Ссылка на квест скопирована!');
                }}
                size="lg"
              >
                <Star className="w-5 h-5 mr-2" />
                Поделиться
              </Button>
            </div>
          </div>
        </div>

        {/* Список заданий в стиле MMORPG */}
        {displayQuest.tasks && displayQuest.tasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#2553A1] flex items-center">
                <Scroll className="w-6 h-6 mr-2" />
                Задания квеста
              </h2>
              <span className="text-sm text-gray-500">
                {completedTasks}/{totalTasks} выполнено
              </span>
            </div>
            
            <div className="space-y-4">
              {displayQuest.tasks.map((task: { 
                id: string; 
                title: string; 
                description: string; 
                xp: number; 
                completed?: boolean 
              }, index: number) => (
                <div 
                  key={task.id || index}
                  className={cn(
                    "border-2 rounded-xl p-5 transition-all duration-300",
                    task.completed 
                      ? "bg-green-50 border-green-300" 
                      : "bg-white border-gray-200 hover:border-[#2553A1] hover:shadow-md"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-start space-x-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                        task.completed
                          ? "bg-green-500 text-white"
                          : "bg-gradient-to-br from-[#2553A1] to-[#3B82F6] text-white"
                      )}>
                        {task.completed ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-semibold text-lg mb-1",
                          task.completed ? "text-green-800 line-through" : "text-gray-800"
                        )}>
                          {task.title}
                        </h3>
                        <p className={cn(
                          "text-sm",
                          task.completed ? "text-green-600" : "text-gray-600"
                        )}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <div className={cn(
                        "flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium",
                        task.completed
                          ? "bg-green-100 text-green-700"
                          : "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700"
                      )}>
                        <Award className="w-4 h-4" />
                        <span>{task.xp || 20} XP</span>
                      </div>
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
