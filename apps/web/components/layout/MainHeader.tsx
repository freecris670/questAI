"use client"; // Required for useState and event handlers

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { LoginModal } from '@/components/auth/LoginModal';

export const MainHeader = () => {
  const { theme, setTheme } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  return (
    <header className="bg-white shadow-[0_2px_4px_rgba(0,0,0,0.05)] fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto max-w-[1200px] h-[80px] flex items-center justify-between px-5">
        <Link href="/" className="text-quest-blue text-2xl font-bold">
          QuestAI
        </Link>
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
        </nav>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};
