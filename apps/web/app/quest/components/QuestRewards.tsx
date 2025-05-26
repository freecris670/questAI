"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Trophy as TrophyIcon,
  Coins as CoinsIcon,
  Sword as SwordIcon
} from 'lucide-react';
import { QuestRewards } from '../types';

interface QuestRewardsProps {
  rewards: QuestRewards;
}

export function QuestRewardsSection({ rewards }: QuestRewardsProps) {
  return (
    <Card className="mb-6 bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Награды за выполнение</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 pt-2">
        <div className="flex flex-col items-center p-4 bg-gray-100/80 dark:bg-gray-700/50 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/70 flex items-center justify-center mb-3">
            <TrophyIcon size={24} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{rewards.xp} XP</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Опыт</span>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-gray-100/80 dark:bg-gray-700/50 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/70 flex items-center justify-center mb-3">
            <CoinsIcon size={24} className="text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{rewards.gold} золота</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Валюта</span>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-gray-100/80 dark:bg-gray-700/50 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/70 flex items-center justify-center mb-3">
            <SwordIcon size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{rewards.itemName}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Предмет</span>
        </div>
      </CardContent>
    </Card>
  );
}
