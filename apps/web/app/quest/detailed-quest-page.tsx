"use client";

import { ChevronLeft as ChevronLeftIcon } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import Link from 'next/link';
import React from 'react';

// Импорт компонентов
import { QuestHeader } from './components/QuestHeader';
import { QuestRewardsSection } from './components/QuestRewards';
import { QuestTasks } from './components/QuestTasks';
import { QuestAchievements } from './components/QuestAchievements';
import { QuestStatsSidebar } from './components/QuestStats';

// Импорт данных квеста
import { questDetails } from './components/questData';

interface PageProps {
  params: {
    id: string; 
  }
}

/**
 * Детальная страница квеста, содержащая информацию о квесте, задачах, наградах и достижениях
 */
export default function DetailedQuestPage({ params }: PageProps) {
  const { id } = params;
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
  } = questDetails;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MainHeader />
      <main className="container mx-auto px-4 py-8 mt-24">
        <div className="flex items-center mb-6">
          <Link href="/quests" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            <ChevronLeftIcon size={16} className="mr-1" /> 
            <span>Назад к квестам</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
            <div className="mt-8">
              <QuestRewardsSection rewards={rewards} />
            </div>
            
            {/* Задачи */}
            <div className="mt-8">
              <QuestTasks tasks={subtasks} activeTaskId={activeTaskId} />
            </div>
            
            {/* Достижения */}
            <div className="mt-8">
              <QuestAchievements achievements={achievements} />
            </div>
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
