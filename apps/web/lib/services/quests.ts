import { QuestDetails, QuestStage, QuestTask, QuestAchievement, QuestStats, UserStats, QuestRewards } from '@/app/quest/types';

// Функция для получения квеста по ID из Supabase
export async function getQuestById(id: string): Promise<QuestDetails | null> {
  try {
    // Импортируем Supabase клиент
    const { supabase } = await import('@/lib/supabase');
    
    // Получаем основные данные квеста
    const { data: questData, error: questError } = await supabase
      .from('quests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (questError) {
      console.error('Ошибка при получении квеста:', questError.message);
      return null;
    }
    
    if (!questData) {
      console.warn(`Квест с ID ${id} не найден`);
      return null;
    }
    
    // Получаем задачи квеста
    const { data: tasksData, error: tasksError } = await supabase
      .from('quest_tasks')
      .select('*')
      .eq('quest_id', id)
      .order('order', { ascending: true });
    
    if (tasksError) {
      console.error('Ошибка при получении задач квеста:', tasksError.message);
    }
    
    // Получаем достижения квеста
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('quest_achievements')
      .select('*')
      .eq('quest_id', id);
    
    if (achievementsError) {
      console.error('Ошибка при получении достижений квеста:', achievementsError.message);
    }
    
    // Получаем этапы квеста
    const { data: stagesData, error: stagesError } = await supabase
      .from('quest_stages')
      .select('*')
      .eq('quest_id', id)
      .order('order', { ascending: true });
    
    if (stagesError) {
      console.error('Ошибка при получении этапов квеста:', stagesError.message);
    }
    
    // Получаем данные о пользователе, создавшем квест
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', questData.user_id)
      .single();
    
    if (userError && userError.code !== 'PGRST116') { // PGRST116 - нет данных
      console.error('Ошибка при получении данных пользователя:', userError.message);
    }
    
    // Преобразуем задачи в формат QuestTask
    const subtasks: QuestTask[] = (tasksData || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed || false,
      xp: task.xp || 100,
      progress: task.progress || 0,
      reward: task.reward || `+${task.xp || 100} XP`
    }));
    
    // Преобразуем достижения в формат QuestAchievement
    const achievements: QuestAchievement[] = (achievementsData || []).map(achievement => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      unlocked: achievement.unlocked || false
    }));
    
    // Преобразуем этапы в формат QuestStage
    const stages: QuestStage[] = (stagesData || []).map(stage => ({
      name: stage.name,
      completed: stage.completed || false
    }));
    
    // Расчет прогресса квеста
    const completedTasks = subtasks.filter(task => task.completed).length;
    const totalTasks = subtasks.length || 1; // Избегаем деления на ноль
    const progress = Math.round((completedTasks / totalTasks) * 100);
    
    // Расчет заработанного XP
    const totalXp = subtasks.reduce((sum, task) => sum + task.xp, 0);
    const earnedXp = subtasks.filter(task => task.completed).reduce((sum, task) => sum + task.xp, 0);
    
    // Создание статистики квеста
    const stats: QuestStats = {
      completion: progress,
      tasksCompleted: completedTasks,
      totalTasks,
      artifactsFound: completedTasks,
      totalArtifacts: totalTasks,
      xpEarned: earnedXp,
      totalXp,
      timeInvested: questData.time_invested || '1ч 0м'
    };
    
    // Создание наград квеста
    const rewards: QuestRewards = {
      xp: questData.reward_xp || totalXp,
      gold: questData.reward_gold || 100,
      itemName: questData.reward_item || 'Магический амулет'
    };
    
    // Создание статистики пользователя
    const user: UserStats = userData ? {
      level: userData.level || 1,
      levelProgress: userData.level_progress || 0,
      xpNeeded: userData.xp_needed || 1000,
      name: userData.name || 'Неизвестный искатель',
      questsCreated: userData.quests_created || 0,
      questsCompleted: userData.quests_completed || 0,
      successRate: userData.success_rate || 0
    } : {
      level: 1,
      levelProgress: 0,
      xpNeeded: 1000,
      name: 'Неизвестный искатель',
      questsCreated: 0,
      questsCompleted: 0,
      successRate: 0
    };
    
    // Формируем полные данные квеста
    const questDetails: QuestDetails = {
      id: questData.id,
      title: questData.title,
      questType: questData.quest_type || 'Приключение',
      createdDays: Math.ceil((Date.now() - new Date(questData.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      description: questData.description,
      progress,
      stages: stages.length > 0 ? stages : await generateDefaultStages(questData),
      currentStage: questData.current_stage || 1,
      activeTaskId: questData.active_task_id || (subtasks[0]?.id || 'sub1'),
      rewards,
      subtasks: subtasks.length > 0 ? subtasks : await generateDefaultTasks(questData),
      achievements: achievements.length > 0 ? achievements : await generateDefaultAchievements(questData),
      stats,
      user
    };
    
    return questDetails;
  } catch (error) {
    console.error('Ошибка при получении квеста из Supabase:', error);
    return null;
  }
}

interface QuestContentRequest {
  description: string;
  title: string;
  questType: string;
  contentType: 'stages' | 'tasks' | 'achievements';
}

interface QuestDataInput {
  description?: string;
  title?: string;
  questType?: string;
  [key: string]: unknown;
}

// Функция для генерации контента через API бэкенда
async function generateContentFromBackend(questData: QuestDataInput, type: 'stages' | 'tasks' | 'achievements'): Promise<unknown> {
  try {
    // Формируем данные для запроса
    const requestData: QuestContentRequest = {
      description: questData.description || 'Квест без описания',
      title: questData.title || 'Неизвестный квест',
      questType: questData.questType || 'adventure',
      contentType: type
    };

    // Получаем URL API из переменных окружения или используем значение по умолчанию
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    
    // Получаем Supabase токен для авторизации запроса, если он есть
    let authHeader = {};
    if (typeof window !== 'undefined') {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        authHeader = {
          Authorization: `Bearer ${data.session.access_token}`
        };
      }
    }
    
    // Отправляем запрос к API
    const response = await fetch(`${apiUrl}/quests/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Ошибка при генерации ${type} через API:`, error);
    // Возвращаем null, чтобы можно было использовать запасной вариант
    return null;
  }
}

// Вспомогательная функция для генерации стандартных этапов, если в БД их нет
async function generateDefaultStages(questData?: QuestDataInput): Promise<QuestStage[]> {
  try {
    // Пытаемся получить этапы через API бэкенда
    const backendResult = await generateContentFromBackend(questData || {}, 'stages');
    if (backendResult && typeof backendResult === 'object' && 'stages' in backendResult) {
      const stages = (backendResult as { stages: unknown[] }).stages;
      return stages.map((stage: unknown, index: number) => {
        const stageObj = stage as Record<string, unknown>;
        return {
          name: typeof stageObj.title === 'string' ? stageObj.title : `Этап ${index + 1}`,
          completed: false
        };
      });
    }
  } catch (error) {
    console.error('Ошибка при генерации этапов через API:', error);
  }

  // Запасной вариант - статические этапы
  return [
    {
      name: 'Подготовка',
      completed: false
    },
    {
      name: 'Выполнение',
      completed: false
    },
    {
      name: 'Завершение',
      completed: false
    }
  ];
}

// Вспомогательная функция для генерации стандартных задач, если в БД их нет
async function generateDefaultTasks(questData?: QuestDataInput): Promise<QuestTask[]> {
  try {
    // Пытаемся получить задачи через API бэкенда
    const backendResult = await generateContentFromBackend(questData || {}, 'tasks');
    if (backendResult && typeof backendResult === 'object' && 'tasks' in backendResult) {
      const tasks = (backendResult as { tasks: unknown[] }).tasks;
      return tasks.map((task: unknown, index: number) => {
        const taskObj = task as Record<string, unknown>;
        return {
          id: `task-${index + 1}`,
          title: typeof taskObj.title === 'string' ? taskObj.title : `Задача ${index + 1}`,
          description: typeof taskObj.description === 'string' ? taskObj.description : '',
          completed: false,
          xp: typeof taskObj.xp === 'number' ? taskObj.xp : 10,
          progress: 0
        };
      });
    }
  } catch (error) {
    console.error('Ошибка при генерации задач через API:', error);
  }

  // Запасной вариант - статические задачи
  return [
    {
      id: 'task-1',
      title: 'Первая задача',
      description: 'Описание первой задачи квеста',
      completed: false,
      xp: 10,
      progress: 0
    },
    {
      id: 'task-2',
      title: 'Вторая задача', 
      description: 'Описание второй задачи квеста',
      completed: false,
      xp: 15,
      progress: 0
    },
    {
      id: 'task-3',
      title: 'Третья задача',
      description: 'Описание третьей задачи квеста',
      completed: false,
      xp: 20,
      progress: 0
    }
  ];
}

// Вспомогательная функция для генерации стандартных достижений, если в БД их нет
async function generateDefaultAchievements(questData?: QuestDataInput): Promise<QuestAchievement[]> {
  try {
    // Пытаемся получить достижения через API бэкенда
    const backendResult = await generateContentFromBackend(questData || {}, 'achievements');
    if (backendResult && typeof backendResult === 'object' && 'achievements' in backendResult) {
      const achievements = (backendResult as { achievements: unknown[] }).achievements;
      return achievements.map((achievement: unknown, index: number) => {
        const achievementObj = achievement as Record<string, unknown>;
        return {
          id: `achievement-${index + 1}`,
          title: typeof achievementObj.title === 'string' ? achievementObj.title : `Достижение ${index + 1}`,
          description: typeof achievementObj.description === 'string' ? achievementObj.description : '',
          unlocked: false
        };
      });
    }
  } catch (error) {
    console.error('Ошибка при генерации достижений через API:', error);
  }
  // Запасной вариант - статические достижения
  return [
    {
      id: 'achievement-1',
      title: 'Первое достижение',
      description: 'Описание первого достижения',
      unlocked: false
    },
    {
      id: 'achievement-2',
      title: 'Второе достижение', 
      description: 'Описание второго достижения',
      unlocked: false
    },
    {
      id: 'achievement-3',
      title: 'Третье достижение',
      description: 'Описание третьего достижения',
      unlocked: false
    }
  ];
}
