import { useQuery, useMutation } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/config';

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
      // Определяем эндпоинт в зависимости от типа квеста
      // Для trial квестов ID может начинаться с 'trial_', но в API мы передаем только ID без префикса
      let endpoint;
      let questId = id;
      
      if (id.startsWith('trial_')) {
        // Для trial квестов используем специальный эндпоинт и убираем префикс 'trial_'
        endpoint = `quests/trial/${id.substring(6)}`;
      } else {
        endpoint = `quests/${id}`;
      }
      
      console.log('Запрос квеста по эндпоинту:', endpoint);
      
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
      
      const response = await fetch(getApiUrl(endpoint), {
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка при получении квеста:', errorText);
        throw new Error(`Ошибка при получении квеста: ${response.status} ${response.statusText}`);
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
      try {
        // Подготавливаем данные для запроса
        const requestData = {
          theme: params.theme,
          difficulty: params.difficulty,
          length: params.length || 'medium',
          additionalDetails: params.additionalDetails || params.theme,
          userId: params.userId || 'anonymous' // Всегда передаем userId
        };

        console.log('Подготовлены данные для запроса:', requestData);
        
        // Получаем токен авторизации из Supabase
        const { supabase } = await import('@/lib/supabase');
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        const authToken = session?.access_token;
        
        console.log('Статус авторизации:', authToken ? 'Авторизован' : 'Не авторизован');
        
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
        console.log('Отправляем запрос на URL:', apiUrl);
        
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
          const errorText = await response.text();
          console.error('Ошибка API при генерации квеста:', errorText);
          
          // Проверяем на лимиты
          if (response.status === 429 || errorText.includes('лимит')) {
            throw new Error('Превышен лимит создания квестов');
          }
          
          throw new Error(`Ошибка при генерации квеста: ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('Ошибка при генерации квеста:', error);
        throw error; // Перебрасываем ошибку для обработки в компоненте
      }
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
