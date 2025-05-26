"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Award as AwardIcon, 
  Lock as LockIcon, 
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from 'lucide-react';
import { QuestAchievement } from '../types';

interface QuestAchievementsProps {
  achievements: QuestAchievement[];
}

export function QuestAchievements({ achievements }: QuestAchievementsProps) {
  return (
    <Card className="bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Достижения</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`p-4 rounded-lg border ${
                achievement.unlocked 
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  achievement.unlocked 
                    ? 'bg-green-100 dark:bg-green-800/70' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {achievement.unlocked ? (
                    <AwardIcon size={20} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <LockIcon size={18} className="text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{achievement.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</p>
                </div>
              </div>
              {achievement.unlocked ? (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircleIcon size={14} className="mr-1" /> Разблокировано
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <InfoIcon size={14} className="mr-1" /> Выполните условия для разблокировки
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
