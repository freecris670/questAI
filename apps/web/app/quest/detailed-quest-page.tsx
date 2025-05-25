"use client";

import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Award, Coins, Star, Share2, Edit3, PlayCircle, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const questDetails = {
  id: '1',
  title: 'Покорение Эвереста (Виртуальное Восхождение)',
  tags: ['#приключение', '#спорт', '#геймификация', '#цель'],
  description: 'Это эпическое виртуальное путешествие, где каждый шаг приближает вас к вершине мира. Выполняйте задания, зарабатывайте очки и открывайте новые этапы восхождения.',
  stages: [
    { name: 'Базовый лагерь', completed: true },
    { name: 'Ледопад Кхумбу', completed: true },
    { name: 'Лагерь II', completed: false },
    { name: 'Вершина Лхоцзе', completed: false },
    { name: 'Южное седло', completed: false },
    { name: 'Вершина', completed: false },
  ],
  currentStageProgress: 33,
  rewards: {
    xp: 500,
    gold: 100,
    achievement: 'Мастер планирования',
  },
  subtasks: [
    { id: 'sub1', text: 'Изучить маршрут и подготовить снаряжение', completed: true, xp: 50 },
    { id: 'sub2', text: 'Пройти акклиматизационный выход на 5000м', completed: true, xp: 70 },
    { id: 'sub3', text: 'Установить Лагерь I', completed: false, xp: 60 },
    { id: 'sub4', text: 'Преодолеть ледовые трещины', completed: false, xp: 80 },
  ],
  achievements: [
    { id: 'ach1', name: 'Первые шаги', unlocked: true, icon: Star },
    { id: 'ach2', name: 'Высокогорный турист', unlocked: true, icon: Star },
    { id: 'ach3', name: 'Ледовый воин', unlocked: false, icon: Lock },
    { id: 'ach4', name: 'Покоритель вершин', unlocked: false, icon: Lock },
  ],
  userStats: {
    questsCompleted: 12,
    totalQuests: 20,
    levelProgress: 60,
  }
};

interface PageProps {
  params: {
    id: string; 
  };
}

export default function DetailedQuestPage({ params }: PageProps) {
  const { title, tags, description, stages, currentStageProgress, rewards, subtasks, achievements, userStats } = questDetails;
  const completedStages = stages.filter(s => s.completed).length;
  const totalStages = stages.length;
  const currentActiveStageIndex = stages.findIndex(stage => !stage.completed);

  return (
    <div className="flex flex-col min-h-screen bg-quest-bg-light dark:bg-quest-bg-dark">
      <MainHeader />
      <main className="flex-grow container mx-auto max-w-[1200px] px-4 py-8 pt-20 md:pt-24">
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-quest-blue dark:text-quest-gray-light mb-2">{title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-quest-emerald/20 text-quest-emerald rounded-full">{tag}</span>
            ))}
          </div>
          <p className="text-gray-700 dark:text-quest-gray-medium">{description}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-quest-blue dark:text-quest-gray-light mb-3">Прогресс квеста</h2>
          <div className="flex items-center mb-2">
            {stages.map((stage, index) => (
              <React.Fragment key={stage.name}>
                <div className={`flex flex-col items-center ${stage.completed ? 'text-quest-emerald' : 'text-gray-400 dark:text-gray-500'}`}>
                  <div className={`w-6 h-6 rounded-full border-2 ${stage.completed ? 'bg-quest-emerald border-quest-emerald' : 'border-gray-400 dark:border-gray-500'} flex items-center justify-center`}>
                    {stage.completed && <CheckCircle size={16} className="text-white"/>}
                  </div>
                  <span className="text-xs mt-1 text-center whitespace-nowrap px-1">{stage.name}</span>
                </div>
                {index < stages.length - 1 && (
                  <div className={`flex-grow h-1 mx-1 rounded-full ${stage.completed ? 'bg-quest-emerald' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    {stage.completed && index === currentActiveStageIndex -1 && currentStageProgress > 0 && (
                       <div className="h-full bg-quest-emerald rounded-full" style={{ width: `${currentStageProgress}%` }}></div>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
           <p className="text-sm text-gray-600 dark:text-gray-400">Этап {completedStages} из {totalStages}. Текущий этап: {stages[currentActiveStageIndex]?.name || 'Завершено'}</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-quest-blue dark:text-quest-gray-light mb-4">Подзадачи</h2>
              <div className="space-y-3">
                {subtasks.map(task => (
                  <Card key={task.id} className={`transition-all ${task.completed ? 'bg-gray-50 dark:bg-gray-700/30 opacity-70' : 'bg-white dark:bg-quest-gray-dark'}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <button className={`w-6 h-6 rounded-full border-2 mr-3 flex-shrink-0 ${task.completed ? 'bg-quest-emerald border-quest-emerald' : 'border-gray-300 dark:border-gray-500 hover:border-quest-emerald'}`}>
                          {task.completed && <CheckCircle size={16} className="text-white m-auto"/>}
                        </button>
                        <span className={`${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-quest-gray-light'}`}>{task.text}</span>
                      </div>
                      <span className="text-sm font-medium text-quest-gold">+{task.xp} XP</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-quest-blue dark:text-quest-gray-light mb-4">Ваши достижения</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {achievements.map(ach => (
                  <div key={ach.id} title={ach.name} className={`p-3 border rounded-lg flex flex-col items-center justify-center aspect-square ${ach.unlocked ? 'border-quest-gold bg-quest-gold/10' : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-60'}`}>
                    <ach.icon size={32} className={`${ach.unlocked ? 'text-quest-gold' : 'text-gray-500'}`} />
                    <span className={`mt-2 text-xs text-center ${ach.unlocked ? 'text-quest-gold font-medium' : 'text-gray-500'}`}>{ach.name}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <Card className="bg-white dark:bg-quest-gray-dark">
              <CardHeader>
                <CardTitle className="text-quest-blue dark:text-quest-gray-light">Награды за квест</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Award size={20} className="text-quest-gold mr-2" />
                  <span className="text-gray-700 dark:text-quest-gray-medium">+{rewards.xp} XP</span>
                </div>
                <div className="flex items-center">
                  <Coins size={20} className="text-yellow-500 mr-2" />
                  <span className="text-gray-700 dark:text-quest-gray-medium">+{rewards.gold} золота</span>
                </div>
                <div className="flex items-center">
                  <Star size={20} className="text-purple-500 mr-2" />
                  <span className="text-gray-700 dark:text-quest-gray-medium">Разблокирует: {rewards.achievement}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-quest-gray-dark">
              <CardHeader>
                <CardTitle className="text-quest-blue dark:text-quest-gray-light">Ваш прогресс</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-2 text-sm">Круговая диаграмма (TODO)</p> 
                <p className="text-center text-gray-700 dark:text-quest-gray-medium mb-1">{userStats.questsCompleted}/{userStats.totalQuests} квестов выполнено</p>
                <Progress value={userStats.levelProgress} className="h-2 mb-2 bg-gray-200 dark:bg-gray-700 [&>div]:bg-quest-emerald" />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">До следующего уровня: {100 - userStats.levelProgress}%</p>
              </CardContent>
            </Card>

            <div className="space-y-3">
                <Button className="w-full bg-quest-emerald text-white hover:bg-quest-emerald/90">
                    <PlayCircle size={20} className="mr-2"/> Начать квест
                </Button>
                <Button variant="outline" className="w-full border-quest-blue text-quest-blue hover:bg-quest-blue/10 dark:border-quest-gray-medium dark:text-quest-gray-light dark:hover:bg-quest-gray-medium/20">
                    <Share2 size={18} className="mr-2"/> Поделиться
                </Button>
                <Button variant="ghost" className="w-full text-quest-blue dark:text-quest-gray-light hover:bg-quest-blue/10 dark:hover:text-quest-blue dark:hover:bg-quest-gray-medium/20">
                    <Edit3 size={18} className="mr-2"/> Редактировать
                </Button>
            </div>
          </aside>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
