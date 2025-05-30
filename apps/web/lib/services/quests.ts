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

// Функция для генерации контента через API бэкенда
async function generateContentFromBackend(questData: any, type: 'stages' | 'tasks' | 'achievements'): Promise<any> {
  try {
    // Формируем данные для запроса
    const requestData = {
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
async function generateDefaultStages(questData?: any): Promise<QuestStage[]> {
  // Пытаемся сгенерировать через API бэкенда
  try {
    const backendResult = await generateContentFromBackend(questData || {}, 'stages');
    
    if (backendResult && backendResult.stages && backendResult.stages.length > 0) {
      return backendResult.stages.map((stage: any, index: number) => ({
        name: stage.name,
        completed: index === 0 // Первый этап считаем выполненным
      }));
    }
  } catch (error) {
    console.error('Ошибка при генерации этапов через API:', error);
  }
  
  // Запасной вариант, если API не сработал
  return [
    { name: 'Начало', completed: true },
    { name: 'Середина', completed: false },
    { name: 'Завершение', completed: false }
  ];
}

// Вспомогательная функция для генерации стандартных задач, если в БД их нет
async function generateDefaultTasks(questData?: any): Promise<QuestTask[]> {
  // Пытаемся сгенерировать через API бэкенда
  try {
    const backendResult = await generateContentFromBackend(questData || {}, 'tasks');
    
    if (backendResult && backendResult.tasks && backendResult.tasks.length > 0) {
      return backendResult.tasks.map((task: any, index: number) => ({
        id: task.id || `sub${index + 1}`,
        title: task.title,
        description: task.description,
        completed: index === 0, // Первую задачу считаем выполненной
        xp: task.xp || 100 + (index * 50), // Увеличиваем XP с каждой задачей
        progress: index === 0 ? 100 : 0,
        reward: `+${task.xp || 100 + (index * 50)} XP`
      }));
    }
  } catch (error) {
    console.error('Ошибка при генерации задач через API:', error);
  }
  
  // Запасной вариант, если API не сработал
  return [
    {
      id: 'sub1',
      title: 'Начать приключение',
      description: 'Ознакомьтесь с описанием квеста и подготовьтесь к выполнению.',
      completed: true,
      xp: 100,
      progress: 100,
      reward: '+100 XP'
    },
    {
      id: 'sub2',
      title: 'Выполнить основное задание',
      description: 'Выполните основную задачу квеста.',
      completed: false,
      xp: 200,
      progress: 0,
      reward: '+200 XP'
    },
    {
      id: 'sub3',
      title: 'Завершить квест',
      description: 'Завершите все необходимые действия и отчитайтесь о выполнении.',
      completed: false,
      xp: 150,
      progress: 0,
      reward: '+150 XP'
    }
  ];
}

// Вспомогательная функция для генерации стандартных достижений, если в БД их нет
async function generateDefaultAchievements(questData?: any): Promise<QuestAchievement[]> {
  // Пытаемся сгенерировать через API бэкенда
  try {
    const backendResult = await generateContentFromBackend(questData || {}, 'achievements');
    
    if (backendResult && backendResult.achievements && backendResult.achievements.length > 0) {
      return backendResult.achievements.map((achievement: any, index: number) => ({
        id: achievement.id || `ach${index + 1}`,
        title: achievement.title,
        description: achievement.description,
        unlocked: index === 0 // Первое достижение считаем разблокированным
      }));
    }
  } catch (error) {
    console.error('Ошибка при генерации достижений через API:', error);
  }
  
  // Запасной вариант, если API не сработал
  return [
    {
      id: 'ach1',
      title: 'Начало пути',
      description: 'Начать квест',
      unlocked: true
    },
    {
      id: 'ach2',
      title: 'Исследователь',
      description: 'Выполнить основное задание',
      unlocked: false
    },
    {
      id: 'ach3',
      title: 'Мастер квестов',
      description: 'Завершить квест полностью',
      unlocked: false
    }
  ];
}
