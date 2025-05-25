import { useState, useCallback } from 'react';
import { IGeneratedQuestData } from '@/components/quests/GeneratedQuestDisplay';
import { generateMockQuestData } from '@/lib/utils/mockQuestData';

interface UseGeneratedQuestOptions {
  initialData?: IGeneratedQuestData | null;
  onStartCallback?: (questData: IGeneratedQuestData) => void;
  onShareCallback?: (questData: IGeneratedQuestData) => void;
}

interface UseGeneratedQuestResult {
  questData: IGeneratedQuestData | null;
  isLoading: boolean;
  error: Error | null;
  generateNewQuest: () => void;
  startQuest: () => void;
  shareQuest: () => void;
}

/**
 * Хук для работы с сгенерированным квестом
 * 
 * Предоставляет функции для генерации, запуска и шеринга квеста,
 * а также данные о текущем квесте и состоянии загрузки
 */
export function useGeneratedQuest({
  initialData = null,
  onStartCallback,
  onShareCallback
}: UseGeneratedQuestOptions = {}): UseGeneratedQuestResult {
  const [questData, setQuestData] = useState<IGeneratedQuestData | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<Error | null>(null);

  // Функция для генерации нового квеста
  const generateNewQuest = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      // В реальном приложении здесь будет API-запрос к бэкенду
      // для генерации квеста с помощью OpenAI
      // Сейчас используем моковые данные для демонстрации
      const newQuestData = generateMockQuestData();
      setQuestData(newQuestData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Произошла ошибка при генерации квеста'));
      console.error('Ошибка при генерации квеста:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Функция для запуска квеста
  const startQuest = useCallback(() => {
    if (!questData) return;
    
    console.log('Запуск квеста:', questData.title);
    
    // Вызываем колбэк, если он был передан
    if (onStartCallback) {
      onStartCallback(questData);
    }
  }, [questData, onStartCallback]);

  // Функция для шеринга квеста
  const shareQuest = useCallback(() => {
    if (!questData) return;
    
    console.log('Шеринг квеста:', questData.title);
    
    // Вызываем колбэк, если он был передан
    if (onShareCallback) {
      onShareCallback(questData);
    }
  }, [questData, onShareCallback]);

  // Генерируем квест при первом рендере, если не был передан initialData
  if (!questData && !isLoading && !error) {
    generateNewQuest();
  }

  return {
    questData,
    isLoading,
    error,
    generateNewQuest,
    startQuest,
    shareQuest
  };
}
