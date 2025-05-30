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
      
      const response = await fetch(getApiUrl(`quests/${id}`), {
        headers,
        credentials: 'include'
      });
      
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
      length?: 'short' | 'medium' | 'long'; // Добавлено поле длины квеста
      userId?: string;                     // Добавлено поле ID пользователя
      additionalDetails?: string;
      isTrial?: boolean;
    }) => {
      try {
        console.log('Начинаем процесс генерации квеста с параметрами:', params);
        
        // Используем разные эндпоинты для авторизованных и неавторизованных пользователей
        const endpoint = params.isTrial ? 'quests/generate/trial' : 'quests/generate';
        console.log('Выбран эндпоинт:', endpoint);
        
        // Убедимся, что все обязательные поля присутствуют
        const requestData = {
          theme: params.theme,
          difficulty: params.difficulty,
          length: params.length || 'medium',      // Значение по умолчанию 'medium'
          userId: params.userId || 'anonymous',  // Значение по умолчанию 'anonymous'
          additionalDetails: params.additionalDetails || params.theme // Используем тему как дополнительную информацию если она не указана
        };

        console.log('Подготовлены данные для запроса:', requestData);
        
        // Получаем токен авторизации из Supabase
        console.log('Получаем сессию из Supabase...');
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
        if (authToken && !params.isTrial) {
          console.log('Добавляем токен авторизации в заголовки');
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        // Для триальных квестов используем специальный эндпоинт
        const apiUrl = getApiUrl(endpoint);
        console.log('Отправляем запрос на URL:', apiUrl);
        
        console.log('Заголовки запроса:', headers);
        
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
          throw new Error(`Ошибка при генерации квеста: ${response.status} ${errorText}`);
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
