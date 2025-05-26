"use client"; // Required for useState and event handlers

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Moon, Sun, Star as StarIcon } from 'lucide-react';
import { LoginModal } from '@/components/auth/LoginModal';

export const MainHeader = () => {
  const { theme, setTheme } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Заглушка для авторизованного пользователя (в реальном приложении будет получаться из контекста или API)
  const isAuthenticated = true;
  const user = {
    name: 'Eldritch Ranger',
    level: 42,
    avatar: 'https://i.pravatar.cc/150?img=68', // Случайный аватар для демонстрации
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.05)] fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto max-w-[1200px] h-[80px] flex items-center justify-between px-5">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-quest-blue dark:text-blue-400 text-2xl font-bold">
            QuestAI
          </Link>
          
          {/* Навигационные ссылки */}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="text-gray-700 dark:text-gray-200 hover:text-quest-blue dark:hover:text-blue-400 font-medium"
              >
                Дашборд
              </Link>
              <Link 
                href="/quests" 
                className="text-gray-700 dark:text-gray-200 hover:text-quest-blue dark:hover:text-blue-400 font-medium"
              >
                Мои квесты
              </Link>
            </div>
          )}
        </div>
        
        <nav className="flex items-center gap-3 md:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            <span className="sr-only">Переключить тему</span>
          </Button>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {/* Информация о пользователе */}
              <div className="flex items-center">
                <div className="mr-3 text-right hidden sm:block">
                  <div className="font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                  <div className="flex items-center text-sm text-amber-500">
                    <StarIcon className="h-4 w-4 mr-1 fill-amber-500" />
                    <span>Уровень {user.level}</span>
                  </div>
                </div>
                
                {/* Аватар с индикатором уровня */}
                <div className="relative">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-gray-800">
                    {user.level}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="border-quest-blue text-quest-blue hover:bg-quest-blue/10 hover:text-quest-blue px-4 py-2 rounded-md text-sm md:text-base h-auto"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Вход
              </Button>
              <Button className="bg-quest-emerald hover:bg-quest-emerald/90 text-white px-4 py-2 rounded-md text-sm md:text-base h-auto">
                Регистрация
              </Button>
            </>
          )}
        </nav>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};
