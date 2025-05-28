"use client";

import { useState } from 'react';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Страница настроек пользователя - реализация этапа 5.1 из UserFlow
 */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("profile");
  
  // Моковые данные для примера
  const [userData, setUserData] = useState({
    avatar: "/avatars/default.png",
    username: "Искатель Приключений",
    email: "user@example.com",
    bio: "Люблю создавать и проходить квесты, которые делают повседневные задачи интересными."
  });
  
  const [preferences, setPreferences] = useState({
    questStyle: "fantasy",
    difficulty: "explorer",
    theme: "system",
    motivation: "achievements"
  });
  
  const [integrations, setIntegrations] = useState({
    calendar: false,
    googleTasks: false,
    microsoftTodo: false
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    questCompletions: true,
    newAchievements: true,
    reminders: true,
    frequency: "daily"
  });
  
  // Обработчики изменения настроек
  const handleProfileChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePreferencesChange = (field: string, value: string | boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };
  
  const handleIntegrationsChange = (field: string, value: boolean) => {
    setIntegrations(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNotificationsChange = (field: string, value: string | boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveSettings = () => {
    // В реальном приложении здесь будет сохранение в базу данных
    console.log('Сохраняем настройки:', { userData, preferences, integrations, notifications });
    // Показываем уведомление об успешном сохранении
    alert('Настройки успешно сохранены');
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
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Настройки профиля</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Управление персональными настройками и предпочтениями</p>
          </div>
          
          <Tabs defaultValue={activeTab} className="w-full" onValueChange={(value) => setActiveTab(value as string)}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <TabsList className="grid grid-cols-4 gap-4">
                <TabsTrigger value="profile">Профиль</TabsTrigger>
                <TabsTrigger value="preferences">Предпочтения</TabsTrigger>
                <TabsTrigger value="integrations">Интеграции</TabsTrigger>
                <TabsTrigger value="notifications">Уведомления</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              {/* Вкладка Профиль */}
              <TabsContent value="profile" className="space-y-6">
                <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                  <div className="w-32 h-32 relative">
                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      <span className="text-4xl text-gray-400 dark:text-gray-500">👤</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute bottom-0 right-0 rounded-full" 
                      onClick={() => alert('Функция изменения аватара будет доступна в полной версии')}
                    >
                      Изменить
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Имя персонажа</Label>
                        <Input 
                          id="username" 
                          value={userData.username} 
                          onChange={(e) => handleProfileChange('username', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          value={userData.email} 
                          onChange={(e) => handleProfileChange('email', e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">О себе</Label>
                      <Textarea 
                        id="bio" 
                        value={userData.bio} 
                        onChange={(e) => handleProfileChange('bio', e.target.value)} 
                        rows={4} 
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Вкладка Предпочтения */}
              <TabsContent value="preferences" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="questStyle">Стиль квестов</Label>
                    <Select 
                      value={preferences.questStyle} 
                      onValueChange={(value) => handlePreferencesChange('questStyle', value)}
                    >
                      <SelectTrigger id="questStyle">
                        <SelectValue placeholder="Выберите стиль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fantasy">Фэнтези</SelectItem>
                        <SelectItem value="scifi">Научная фантастика</SelectItem>
                        <SelectItem value="realism">Реализм</SelectItem>
                        <SelectItem value="cyberpunk">Киберпанк</SelectItem>
                        <SelectItem value="historical">Исторический</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Сложность</Label>
                    <Select 
                      value={preferences.difficulty} 
                      onValueChange={(value) => handlePreferencesChange('difficulty', value)}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Выберите сложность" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Новичок</SelectItem>
                        <SelectItem value="explorer">Искатель приключений</SelectItem>
                        <SelectItem value="hero">Героический режим</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme">Тема интерфейса</Label>
                    <Select 
                      value={preferences.theme} 
                      onValueChange={(value) => handlePreferencesChange('theme', value)}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Выберите тему" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Светлая</SelectItem>
                        <SelectItem value="dark">Темная</SelectItem>
                        <SelectItem value="system">Системная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="motivation">Что вас мотивирует?</Label>
                    <Select 
                      value={preferences.motivation} 
                      onValueChange={(value) => handlePreferencesChange('motivation', value)}
                    >
                      <SelectTrigger id="motivation">
                        <SelectValue placeholder="Выберите тип мотивации" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="achievements">Достижения</SelectItem>
                        <SelectItem value="progress">Прогресс</SelectItem>
                        <SelectItem value="competition">Соревнование</SelectItem>
                        <SelectItem value="rewards">Награды</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              {/* Вкладка Интеграции */}
              <TabsContent value="integrations" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-base">Google Календарь</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Синхронизация квестов с вашим календарем</p>
                    </div>
                    <Switch 
                      checked={integrations.calendar} 
                      onCheckedChange={(value) => handleIntegrationsChange('calendar', value)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-base">Google Tasks</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Импорт задач из Google Tasks</p>
                    </div>
                    <Switch 
                      checked={integrations.googleTasks} 
                      onCheckedChange={(value) => handleIntegrationsChange('googleTasks', value)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-base">Microsoft To Do</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Импорт задач из Microsoft To Do</p>
                    </div>
                    <Switch 
                      checked={integrations.microsoftTodo} 
                      onCheckedChange={(value) => handleIntegrationsChange('microsoftTodo', value)} 
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Вкладка Уведомления */}
              <TabsContent value="notifications" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email уведомления</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Получать уведомления на электронную почту</p>
                    </div>
                    <Switch 
                      checked={notifications.email} 
                      onCheckedChange={(value) => handleNotificationsChange('email', value)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-base">Браузерные уведомления</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Получать уведомления в браузере</p>
                    </div>
                    <Switch 
                      checked={notifications.browser} 
                      onCheckedChange={(value) => handleNotificationsChange('browser', value)} 
                    />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-lg">Типы уведомлений</h3>
                    
                    <div className="flex items-center justify-between py-2">
                      <Label className="text-base">Завершение квестов</Label>
                      <Switch 
                        checked={notifications.questCompletions} 
                        onCheckedChange={(value) => handleNotificationsChange('questCompletions', value)} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <Label className="text-base">Новые достижения</Label>
                      <Switch 
                        checked={notifications.newAchievements} 
                        onCheckedChange={(value) => handleNotificationsChange('newAchievements', value)} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <Label className="text-base">Напоминания</Label>
                      <Switch 
                        checked={notifications.reminders} 
                        onCheckedChange={(value) => handleNotificationsChange('reminders', value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="frequency">Частота уведомлений</Label>
                    <Select 
                      value={notifications.frequency} 
                      onValueChange={(value) => handleNotificationsChange('frequency', value)}
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Выберите частоту" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">В реальном времени</SelectItem>
                        <SelectItem value="daily">Ежедневно</SelectItem>
                        <SelectItem value="weekly">Еженедельно</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-quest-blue hover:bg-quest-blue/90">
              Сохранить настройки
            </Button>
          </div>
        </div>
      </main>
      
      <MainFooter />
    </div>
  );
}
