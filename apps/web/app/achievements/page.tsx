"use client";

import { useState } from 'react';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { ChevronLeft, Medal, Star, Award, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Типы для достижений и наград
interface IAchievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  date?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * Страница достижений и наград пользователя - реализация этапа 5.2 из UserFlow
 */
export default function AchievementsPage() {
  // Активная вкладка
  const [activeTab, setActiveTab] = useState('all');
  
  // Моковые данные для примера
  const [userLevel] = useState(12);
  const [userXp] = useState(1250);
  const [nextLevelXp] = useState(1500);
  
  // Моковые данные достижений
  const achievements: IAchievement[] = [
    {
      id: '1',
      title: 'Первый шаг',
      description: 'Завершите ваш первый квест',
      icon: <Medal className="w-6 h-6" />,
      unlocked: true,
      date: '15.05.2025',
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Искатель приключений',
      description: 'Завершите 10 квестов',
      icon: <Trophy className="w-6 h-6" />,
      unlocked: true,
      date: '20.05.2025',
      rarity: 'uncommon'
    },
    {
      id: '3',
      title: 'Мастер квестов',
      description: 'Завершите 50 квестов',
      icon: <Award className="w-6 h-6" />,
      unlocked: false,
      progress: 12,
      maxProgress: 50,
      rarity: 'epic'
    },
    {
      id: '4',
      title: 'Творец миров',
      description: 'Создайте 20 оригинальных квестов',
      icon: <Star className="w-6 h-6" />,
      unlocked: false,
      progress: 3,
      maxProgress: 20,
      rarity: 'rare'
    },
    {
      id: '5',
      title: 'Легенда QuestAI',
      description: 'Достигните 20 уровня',
      icon: <Zap className="w-6 h-6" />,
      unlocked: false,
      progress: 5,
      maxProgress: 20,
      rarity: 'legendary'
    }
  ];
  
  // Фильтрация достижений
  const filteredAchievements = activeTab === 'all' 
    ? achievements 
    : activeTab === 'unlocked' 
      ? achievements.filter(a => a.unlocked) 
      : achievements.filter(a => !a.unlocked);
  
  // Функция для определения цвета значка редкости
  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'bg-gray-500 text-white';
      case 'uncommon': return 'bg-green-500 text-white';
      case 'rare': return 'bg-blue-600 text-white';
      case 'epic': return 'bg-purple-600 text-white';
      case 'legendary': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  // Функция для получения русского названия редкости
  const getRarityName = (rarity: string) => {
    switch(rarity) {
      case 'common': return 'Обычное';
      case 'uncommon': return 'Необычное';
      case 'rare': return 'Редкое';
      case 'epic': return 'Эпическое';
      case 'legendary': return 'Легендарное';
      default: return 'Обычное';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <MainHeader />
      
      <main className="container mx-auto px-4 py-8 mt-24 flex-grow">
        <div className="flex items-center mb-6">
          <Link href="/my-quests" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            <ChevronLeft size={16} className="mr-1" /> 
            <span>Назад к квестам</span>
          </Link>
        </div>
        
        {/* Шапка страницы достижений */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Мои достижения</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Разблокируйте уникальные награды и повышайте свой уровень
              </p>
            </div>
            
            <div className="flex items-center mt-4 md:mt-0">
              <div className="bg-quest-blue/10 dark:bg-quest-blue/20 rounded-full px-4 py-2 flex items-center">
                <span className="text-quest-blue text-xl font-semibold mr-2">Уровень {userLevel}</span>
                <Trophy className="text-quest-blue w-5 h-5" />
              </div>
            </div>
          </div>
          
          {/* Прогресс уровня */}
          <div className="px-6 pb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Прогресс уровня</span>
              <span>{userXp}/{nextLevelXp} XP</span>
            </div>
            <Progress value={(userXp / nextLevelXp) * 100} className="h-2" />
          </div>
        </div>
        
        {/* Вкладки фильтрации достижений */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <TabsList className="grid grid-cols-3 gap-4">
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="unlocked">Разблокированные</TabsTrigger>
                <TabsTrigger value="locked">Заблокированные</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`border rounded-lg p-5 transition-all ${
                      achievement.unlocked 
                        ? 'border-quest-blue/30 bg-quest-blue/5 dark:border-quest-blue/20 dark:bg-quest-blue/10' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.unlocked 
                          ? 'bg-quest-blue/20 text-quest-blue' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }`}>
                        {achievement.icon}
                      </div>
                      <Badge className={`${getRarityColor(achievement.rarity)}`}>
                        {getRarityName(achievement.rarity)}
                      </Badge>
                    </div>
                    
                    <h3 className={`text-lg font-medium mb-2 ${
                      achievement.unlocked 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.title}
                    </h3>
                    
                    <p className={`text-sm mb-4 ${
                      achievement.unlocked 
                        ? 'text-gray-600 dark:text-gray-300' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {achievement.unlocked && achievement.date && (
                      <div className="text-xs text-quest-blue font-medium">
                        Разблокировано {achievement.date}
                      </div>
                    )}
                    
                    {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Прогресс</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-1.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="unlocked" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`border rounded-lg p-5 transition-all ${
                      achievement.unlocked 
                        ? 'border-quest-blue/30 bg-quest-blue/5 dark:border-quest-blue/20 dark:bg-quest-blue/10' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.unlocked 
                          ? 'bg-quest-blue/20 text-quest-blue' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }`}>
                        {achievement.icon}
                      </div>
                      <Badge className={`${getRarityColor(achievement.rarity)}`}>
                        {getRarityName(achievement.rarity)}
                      </Badge>
                    </div>
                    
                    <h3 className={`text-lg font-medium mb-2 ${
                      achievement.unlocked 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.title}
                    </h3>
                    
                    <p className={`text-sm mb-4 ${
                      achievement.unlocked 
                        ? 'text-gray-600 dark:text-gray-300' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {achievement.unlocked && achievement.date && (
                      <div className="text-xs text-quest-blue font-medium">
                        Разблокировано {achievement.date}
                      </div>
                    )}
                    
                    {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Прогресс</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-1.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="locked" className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`border rounded-lg p-5 transition-all ${
                      achievement.unlocked 
                        ? 'border-quest-blue/30 bg-quest-blue/5 dark:border-quest-blue/20 dark:bg-quest-blue/10' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.unlocked 
                          ? 'bg-quest-blue/20 text-quest-blue' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }`}>
                        {achievement.icon}
                      </div>
                      <Badge className={`${getRarityColor(achievement.rarity)}`}>
                        {getRarityName(achievement.rarity)}
                      </Badge>
                    </div>
                    
                    <h3 className={`text-lg font-medium mb-2 ${
                      achievement.unlocked 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {achievement.title}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {achievement.description}
                    </p>
                    
                    {achievement.unlocked ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Разблокировано: {achievement.date}
                      </div>
                    ) : achievement.progress !== undefined && achievement.maxProgress !== undefined ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Прогресс</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-1.5" 
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              
              {filteredAchievements.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {activeTab === 'unlocked' 
                      ? 'У вас пока нет разблокированных достижений' 
                      : 'Все достижения уже разблокированы'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <MainFooter />
    </div>
  );
}
