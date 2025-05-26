"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Play as PlayIcon, 
  Share2 as Share2Icon, 
  Check as CheckIcon 
} from 'lucide-react';
import { QuestStage } from '../types';

interface QuestHeaderProps {
  title: string;
  questType: string;
  createdDays: number;
  description: string;
  progress: number;
  stages: QuestStage[];
}

export function QuestHeader({ 
  title, 
  questType, 
  createdDays, 
  description, 
  progress, 
  stages 
}: QuestHeaderProps) {
  return (
    <Card className="mb-6 bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Badge variant="outline" className="mr-2 border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400">{questType}</Badge>
          <span className="text-sm text-gray-500 dark:text-gray-400">Создан {createdDays} дней назад</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{description}</p>
        
        {/* Прогресс квеста */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Прогресс квеста</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-3 bg-gray-200 dark:bg-gray-700" 
            indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
        
        {/* Этапы квеста */}
        <div className="flex justify-between items-center mb-6">
          {stages.map((stage, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${stage.completed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {stage.completed ? (
                  <CheckIcon size={18} />
                ) : (
                  <span className="font-medium">{index + 1}</span>
                )}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[80px] truncate">{stage.name}</span>
            </div>
          ))}
        </div>
        
        {/* Кнопки действий */}
        <div className="flex space-x-3">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
            <PlayIcon size={18} className="mr-2" /> Продолжить
          </Button>
          <Button variant="outline" className="flex-1 border-gray-300 dark:border-gray-600">
            <Share2Icon size={18} className="mr-2" /> Поделиться
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
