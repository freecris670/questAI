import { useQuery, useMutation } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/config';

interface QuestTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  xp: number;
}

interface QuestData {
  tasks?: QuestTask[];
  subtasks?: QuestTask[];
  [key: string]: unknown;
}

/**
 * Валидация данных квеста
 * @param questData Данные квеста с сервера
 * @returns Валидированные данные квеста
 */
function validateQuestData(questData: unknown): QuestData | null {
  if (!questData || typeof questData !== 'object') return null;
  
  // Создаем копию данных для валидации
  const validatedData = { ...questData } as QuestData;
  
  // Проверяем наличие и валидность поля tasks
  if (!validatedData.tasks || !Array.isArray(validatedData.tasks)) {
    validatedData.tasks = [];
  } else {
    // Проверяем каждую задачу на наличие обязательных полей
    validatedData.tasks = validatedData.tasks.map((task: unknown) => {
      const taskObj = task as Record<string, unknown>;
      return {
        id: typeof taskObj.id === 'string' ? taskObj.id : `task-${Math.random().toString(36).substring(2, 9)}`,
        title: typeof taskObj.title === 'string' ? taskObj.title : 'Задача',
        description: typeof taskObj.description === 'string' ? taskObj.description : '',
        completed: typeof taskObj.completed === 'boolean' ? taskObj.completed : false,
        xp: typeof taskObj.xp === 'number' ? taskObj.xp : 10
      };
    });
  }
  
  // Проверяем наличие и валидность поля subtasks
  if (!validatedData.subtasks || !Array.isArray(validatedData.subtasks)) {
    validatedData.subtasks = [];
  } else {
    // Проверяем каждую подзадачу на наличие обязательных полей
    validatedData.subtasks = validatedData.subtasks.map((task: unknown) => {
      const taskObj = task as Record<string, unknown>;
      return {
        id: typeof taskObj.id === 'string' ? taskObj.id : `subtask-${Math.random().toString(36).substring(2, 9)}`,
        title: typeof taskObj.title === 'string' ? taskObj.title : 'Задача',
        description: typeof taskObj.description === 'string' ? taskObj.description : '',
        completed: typeof taskObj.completed === 'boolean' ? taskObj.completed : false,
        xp: typeof taskObj.xp === 'number' ? taskObj.xp : 5
      };
    });
  }
  
  return validatedData;
}

/**
 * Хук для получения списка квестов
 * @param userId Опциональный ID пользователя для фильтрации
 */
export function useQuests(userId?: string) {
  return useQuery({
    queryKey: ['quests', { userId }],
    queryFn: async () => {
      // Получаем токен авторизации из Supabase
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      // Формируем заголовки запроса
      const headers: HeadersInit = {};
      
      // Добавляем заголовок авторизации, если есть токен
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Для неавторизованных пользователей получаем trial квесты
      if (!authToken && !userId) {
        const response = await fetch(getApiUrl('quests/trial'), {
          headers,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Ошибка при получении trial квестов');
        }
        
        return response.json();
      }
      
      // Для авторизованных пользователей получаем обычные квесты
      const params = new URLSearchParams();
      if (userId) {
        params.append('userId', userId);
      }
      
      const response = await fetch(getApiUrl(`quests?${params.toString()}`), {
        headers,
        credentials: 'include'
      });
      
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
      // Получаем токен авторизации из Supabase
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      // Формируем заголовки запроса
      const headers: HeadersInit = {};
      
      // Добавляем заголовок авторизации, если есть токен
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Сначала пытаемся найти квест в основной таблице
      const response = await fetch(getApiUrl(`quests/${id}`), {
        headers,
        credentials: 'include'
      });
      
      if (response.ok) {
        const questData = await response.json();
        return validateQuestData(questData);
      }
      
      // Если квест не найден в основной таблице (404), пробуем trial таблицу
      if (response.status === 404) {
        const trialResponse = await fetch(getApiUrl(`quests/trial/${id}`), {
          headers,
          credentials: 'include'
        });
        
        if (trialResponse.ok) {
          const trialQuestData = await trialResponse.json();
          return validateQuestData(trialQuestData);
        }
        
        throw new Error(`Ошибка при получении trial квеста: ${trialResponse.status} ${trialResponse.statusText}`);
      }
      
      throw new Error(`Ошибка при получении квеста: ${response.status} ${response.statusText}`);
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
      // Получаем токен авторизации из Supabase
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      // Формируем заголовки запроса
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Добавляем заголовок авторизации, если есть токен
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(getApiUrl('quests'), {
        method: 'POST',
        headers,
        credentials: 'include',
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
      length?: 'short' | 'medium' | 'long';
      userId?: string;
      additionalDetails?: string;
    }) => {
      // Подготавливаем данные для запроса
      const requestData = {
        theme: params.theme,
        difficulty: params.difficulty,
        length: params.length || 'medium',
        additionalDetails: params.additionalDetails || params.theme,
        userId: params.userId || 'anonymous' // Всегда передаем userId
      };

      // Получаем токен авторизации из Supabase
      const { supabase } = await import('@/lib/supabase');
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      const authToken = session?.access_token;
      
      // Формируем заголовки запроса
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Добавляем заголовок авторизации, если есть токен
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Используем единый эндпоинт для всех квестов
      const apiUrl = getApiUrl('quests/generate');
      
      // Устанавливаем таймаут для запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 секунд таймаут
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        credentials: 'include', // Важно для работы с куками и проверки лимитов
        body: JSON.stringify(requestData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Очищаем таймаут после получения ответа
      
      if (!response.ok) {
        throw new Error(`Ошибка при генерации квеста: ${response.status}`);
      }
      
      return response.json();
    }
  });
}

/**
 * Хук для обновления прогресса задачи квеста
 * @param questId ID квеста
 */
export function useUpdateTaskProgress(questId: string) {
  return useMutation({
    mutationFn: async (data: {
      taskId: string;
      completed: boolean;
      progress?: number;
    }) => {
      // Получаем токен авторизации из Supabase
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      // Формируем заголовки запроса
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Добавляем заголовок авторизации, если есть токен
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(getApiUrl(`quests/${questId}/progress`), {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении прогресса задачи');
      }

      return response.json();
    }
  });
}
