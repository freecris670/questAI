import { useState, useCallback } from 'react';
import { IGeneratedQuestData } from '@/components/quests/GeneratedQuestDisplay';
import { useGenerateQuest, useCreateQuest } from '@/lib/hooks/useQuests';

interface UseGeneratedQuestOptions {
  initialData?: IGeneratedQuestData | null;
  onStartCallback?: (_questData: IGeneratedQuestData) => void;
  onShareCallback?: (_questData: IGeneratedQuestData) => void;
}

interface UseGeneratedQuestResult {
  questData: IGeneratedQuestData | null;
  isLoading: boolean;
  error: Error | null;
  generateNewQuest: (_params?: {
    theme?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    additionalDetails?: string;
  }) => void;
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

  // Мутации для взаимодействия с бекендом
  const generateQuestMutation = useGenerateQuest();
  const createQuestMutation = useCreateQuest();

  // Функция для генерации нового квеста
  const generateNewQuest = useCallback(async (_params?: {
    theme?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    additionalDetails?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const finalParams = {
        theme: _params?.theme ?? 'Random',
        difficulty: _params?.difficulty ?? 'easy',
        ...(_params?.additionalDetails ? { additionalDetails: _params.additionalDetails } : {})
      };

      const newQuestData = await generateQuestMutation.mutateAsync(finalParams);
      setQuestData(newQuestData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Произошла ошибка при генерации квеста'));
      console.error('Ошибка при генерации квеста:', err);
    } finally {
      setIsLoading(false);
    }
  }, [generateQuestMutation]);

  // Функция для запуска квеста (сохраняем квест в базе)
  const startQuest = useCallback(async () => {
    if (!questData) return;

    try {
      await createQuestMutation.mutateAsync({
        title: questData.title,
        description: questData.story,
        content: questData as unknown as Record<string, unknown>,
      });

      if (onStartCallback) {
        onStartCallback(questData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Не удалось запустить квест'));
      console.error('Ошибка запуска квеста:', err);
    }
  }, [questData, onStartCallback, createQuestMutation]);

  // Функция для шеринга квеста
  const shareQuest = useCallback(() => {
    if (!questData) return;
    
    console.warn('Шеринг квеста:', questData.title);
    
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
