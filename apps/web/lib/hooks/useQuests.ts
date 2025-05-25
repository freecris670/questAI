import { useQuery, useMutation } from '@tanstack/react-query';

/**
 * Хук для получения списка квестов
 * @param userId Опциональный ID пользователя для фильтрации
 */
export function useQuests(userId?: string) {
  return useQuery({
    queryKey: ['quests', { userId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) {
        params.append('userId', userId);
      }
      
      const response = await fetch(`/api/quests?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Ошибка при получении квестов');
      }
      
      return response.json();
    }
  });
}

/**
 * Хук для получения квеста по ID
 * @param id ID квеста
 */
export function useQuest(id: string) {
  return useQuery({
    queryKey: ['quest', id],
    queryFn: async () => {
      const response = await fetch(`/api/quests/${id}`);
      if (!response.ok) {
        throw new Error('Ошибка при получении квеста');
      }
      
      return response.json();
    },
    enabled: !!id
  });
}

/**
 * Хук для создания нового квеста
 */
export function useCreateQuest() {
  return useMutation({
    mutationFn: async (questData: {
      title: string;
      description?: string;
      content: Record<string, unknown>;
      is_public?: boolean;
    }) => {
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questData)
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при создании квеста');
      }
      
      return response.json();
    }
  });
}

/**
 * Хук для генерации квеста с помощью AI
 */
export function useGenerateQuest() {
  return useMutation({
    mutationFn: async (params: {
      theme: string;
      difficulty: 'easy' | 'medium' | 'hard';
      additionalDetails?: string;
    }) => {
      const response = await fetch('/api/quests/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при генерации квеста');
      }
      
      return response.json();
    }
  });
}
