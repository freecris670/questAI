"use client";

import { useParams, useRouter } from 'next/navigation';
import { useQuest, useUpdateTaskProgress } from '@/lib/hooks/useQuests';
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

// Интерфейс для задач, которые приходят с бэкенда
interface BackendQuestTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xp: number;
}

// Интерфейс для данных квеста
interface QuestData {
  id: string;
  title: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: string;
  tasks?: BackendQuestTask[];
  subtasks?: BackendQuestTask[];
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
  }>;
  questType?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'completed';
  participantsCount?: number;
}

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
  
  // Используем хук для загрузки квеста (он автоматически определит trial или обычный)
  const { data: questData, isLoading, error, refetch } = useQuest(questId);
  
  // Хук для обновления статуса задачи
  const updateTaskMutation = useUpdateTaskProgress(questId);

  // Типизируем данные квеста
  const quest = questData as QuestData | null;

  // Валидация и нормализация данных квеста
  if (quest) {
    // Проверяем наличие и валидность поля tasks
    if (!quest.tasks || !Array.isArray(quest.tasks)) {
      quest.tasks = [];
    }
    
    // Проверяем наличие и валидность поля subtasks
    if (!quest.subtasks || !Array.isArray(quest.subtasks)) {
      quest.subtasks = [];
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <Spinner className="w-12 h-12 text-[#2553A1]" />
      </div>
    );
  }

  if (error || !quest) {
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

  // Вычисляем прогресс квеста
  const tasks = [...(quest.tasks || []), ...(quest.subtasks || [])] as BackendQuestTask[];
  const completedTasks = tasks.filter((task: BackendQuestTask) => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalXP = tasks.reduce((sum: number, task: BackendQuestTask) => sum + task.xp, 0);
  const earnedXP = tasks.filter((task: BackendQuestTask) => task.completed).reduce((sum: number, task: BackendQuestTask) => sum + task.xp, 0);

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col">
      <MainHeader />
      
      <main className="flex-grow container mx-auto max-w-[1200px] px-5 py-5 md:py-10 mt-20">
        <div className="flex items-center mb-6">
          <Link href="/my-quests" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            <ChevronLeftIcon size={16} className="mr-1" /> 
            <span>Назад к квестам</span>
          </Link>
          <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            ID квеста: {questId}
          </div>
        </div>
        
        {/* Ненавязчивое предложение регистрации */}
        {!user && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-[#2553A1]" />
              <p className="text-gray-700">
                Зарегистрируйтесь, чтобы сохранить прогресс и получить доступ к дополнительным возможностям!
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-[#2553A1] text-[#2553A1] hover:bg-[#2553A1]/10 rounded-md"
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
                  {quest.title || 'Загрузка...'}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1",
                    getDifficultyColor(quest.difficulty)
                  )}>
                    {getDifficultyIcon(quest.difficulty)}
                    <span>{quest.difficulty || 'Средний'} уровень</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Контент квеста */}
          <div className="p-6 md:p-8">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {quest.description || ''}
            </p>
            
            {/* Прогресс квеста */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Прогресс квеста</span>
                <span className="text-sm font-bold text-[#2553A1]">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {completedTasks} из {totalTasks} заданий выполнено
                </span>
                <span className="text-xs text-[#22B07D] font-medium">
                  +{totalXP} XP
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
                <p className="text-2xl font-bold text-blue-900">{quest.estimatedTime || '30 мин'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center space-x-2 text-emerald-700 mb-1">
                  <Gem className="w-5 h-5" />
                  <span className="font-medium">Награда</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">{totalXP} XP</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-700 mb-1">
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Задания</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{totalTasks}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center space-x-2 text-orange-700 mb-1">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Герои</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">{quest.participantsCount || 0}</p>
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
        {tasks && tasks.length > 0 ? (
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
              {tasks.map((task: BackendQuestTask, index: number) => (
                <div 
                  key={task.id || `task-${index}`}
                  className={cn(
                    "border-2 rounded-xl p-5 transition-all duration-300",
                    task.completed 
                      ? "bg-green-50 border-green-300" 
                      : "bg-white border-gray-200 hover:border-[#2553A1] hover:shadow-md"
                  )}
                  onClick={() => {
                    // Обработка клика по задаче для изменения статуса
                    updateTaskMutation.mutate(
                      {
                        taskId: task.id || `task_${index}`,
                        completed: !task.completed,
                      },
                      {
                        onSuccess: () => {
                          // Обновляем данные квеста после успешного обновления статуса
                          refetch();
                        },
                        onError: (error) => {
                          console.error('Ошибка при обновлении статуса задачи:', error);
                        }
                      }
                    );
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-start space-x-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold cursor-pointer",
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
                        <span>{task.xp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>
      
      <MainFooter />
    </div>
  );
}
