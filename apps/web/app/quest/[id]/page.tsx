"use client";

import { ChevronLeft as ChevronLeftIcon } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// Импорт компонентов
import { QuestHeader } from '../components/QuestHeader';
import { QuestRewardsSection } from '../components/QuestRewards';
import { QuestTasks } from '../components/QuestTasks';
import { QuestAchievements } from '../components/QuestAchievements';
import { QuestStatsSidebar } from '../components/QuestStats';

// Импорт типов и сервиса квестов
import { QuestDetails } from '../types';
import { getQuestById } from '@/lib/services/quests';
import { getSampleQuestById } from '@/lib/services/questData';

interface PageProps {
  params: {
    id: string; 
  }
}

/**
 * Детальная страница квеста, содержащая информацию о квесте, задачах, наградах и достижениях
 */
export default function DetailedQuestPage() {
  // В Next.js 15+ используем useParams для получения параметров маршрута
  const params = useParams();
  const id = params.id as string;
  const [quest, setQuest] = useState<QuestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchQuest() {
      try {
        setLoading(true);
        // Используем данные из JSON-файла вместо API
        const questData = await getSampleQuestById(id);
        setQuest(questData);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке квеста:', err);
        setError('Не удалось загрузить данные квеста');
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuest();
  }, [id]);
  
  // Показываем загрузку
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <MainHeader />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <p className="text-lg text-blue-600 dark:text-blue-400">Загрузка квеста...</p>
          </div>
        </main>
      </div>
    );
  }
  
  // Показываем ошибку
  if (error || !quest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <MainHeader />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <p className="text-lg text-red-600 dark:text-red-400">{error || 'Квест не найден'}</p>
            <Link href="/quests" className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Вернуться к списку квестов
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  const { 
    title, 
    questType, 
    createdDays, 
    description, 
    progress, 
    stages, 
    activeTaskId,
    rewards,
    subtasks,
    achievements,
    stats,
    user
  } = quest;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MainHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/quests" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            <ChevronLeftIcon size={16} className="mr-1" /> 
            <span>Назад к квестам</span>
          </Link>
          <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            ID квеста: {id}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Левая панель - основная информация */}
          <div className="lg:col-span-8">
            {/* Заголовок квеста */}
            <QuestHeader 
              title={title}
              questType={questType}
              createdDays={createdDays}
              description={description}
              progress={progress}
              stages={stages}
            />
            
            {/* Награды */}
            <QuestRewardsSection rewards={rewards} />
            
            {/* Задачи */}
            <QuestTasks tasks={subtasks} activeTaskId={activeTaskId} />
            
            {/* Достижения */}
            <QuestAchievements achievements={achievements} />
          </div>
          
          {/* Правая панель - статистика */}
          <div className="lg:col-span-4">
            <QuestStatsSidebar stats={stats} user={user} />
          </div>
        </div>
      </main>
    </div>
  );
}
