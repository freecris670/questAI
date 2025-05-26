"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { QuestStats, UserStats } from '../types';

interface QuestStatsProps {
  stats: QuestStats;
  user: UserStats;
}

export function QuestStatsSidebar({ stats, user }: QuestStatsProps) {
  return (
    <>
      {/* Статистика квеста */}
      <Card className="mb-6 bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Статистика квеста</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Выполнение</span>
              <span className="font-medium">{stats.completion}%</span>
            </div>
            <Progress value={stats.completion} className="h-2 bg-gray-200 dark:bg-gray-700" />
          </div>
          
          <Separator className="bg-gray-200 dark:bg-gray-700" />
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Выполнено задач:</span>
            <span className="font-medium">{stats.tasksCompleted}/{stats.totalTasks}</span>
          </div>
          
          <Separator className="bg-gray-200 dark:bg-gray-700" />
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Найдено артефактов:</span>
            <span className="font-medium">{stats.artifactsFound}/{stats.totalArtifacts}</span>
          </div>
          
          <Separator className="bg-gray-200 dark:bg-gray-700" />
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Заработано XP:</span>
            <span className="font-medium">{stats.xpEarned}/{stats.totalXp}</span>
          </div>
          
          <Separator className="bg-gray-200 dark:bg-gray-700" />
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Затраченное время:</span>
            <span className="font-medium">{stats.timeInvested}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Следующий уровень */}
      <Card className="mb-6 bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Следующий уровень</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-600 dark:text-gray-400">Уровень {user.level}</span>
            <span className="text-gray-600 dark:text-gray-400">Уровень {user.level + 1}</span>
          </div>
          <Progress 
            value={user.levelProgress} 
            className="h-2 mb-2 bg-gray-200 dark:bg-gray-700" 
            indicatorClassName="bg-purple-600 dark:bg-purple-500"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {user.xpNeeded} XP необходимо для следующего уровня
          </p>
        </CardContent>
      </Card>
      
      {/* История квестов */}
      <Card className="bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">История квестов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Создано квестов:</span>
            <span className="font-medium">{user.questsCreated}</span>
          </div>
          
          <Separator className="bg-gray-200 dark:bg-gray-700" />
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Выполнено квестов:</span>
            <span className="font-medium">{user.questsCompleted}</span>
          </div>
          
          <Separator className="bg-gray-200 dark:bg-gray-700" />
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Процент успеха:</span>
            <span className="font-medium">{user.successRate}%</span>
          </div>
          
          <Button variant="outline" className="w-full mt-4 text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800">
            <BarChart3 size={18} className="mr-2" /> Подробная аналитика
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
