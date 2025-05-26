"use client";

import { useState, useEffect } from 'react';
import { X as CloseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface TrialLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  questsCreated: number;
  maxTrialQuests?: number;
}

/**
 * Модальное окно, отображаемое при достижении лимита пробной версии
 */
export function TrialLimitModal({ 
  isOpen, 
  onClose, 
  questsCreated, 
  maxTrialQuests = 2 
}: TrialLimitModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative animate-scaleIn">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <CloseIcon size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-quest-blue"
            >
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Достигнут лимит пробной версии
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Вы создали {questsCreated} из {maxTrialQuests} доступных квестов в пробной версии. Чтобы продолжить создавать неограниченное количество квестов, пожалуйста, зарегистрируйтесь.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Link href="/register" className="w-full">
            <Button
              className="w-full bg-quest-blue hover:bg-quest-blue/90 text-white font-medium py-2 px-4 rounded transition"
            >
              Зарегистрироваться
            </Button>
          </Link>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded transition"
          >
            Продолжить с ограничениями
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Регистрация занимает меньше минуты и позволяет сохранять все созданные квесты
        </p>
      </div>
    </div>
  );
}
