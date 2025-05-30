import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { OpenAiService } from '../openai/openai.service';
import { CreateQuestDto, UpdateQuestDto, GenerateQuestDto, UpdateQuestProgressDto, PublishQuestDto, GenerateContentDto } from './dto';
import { IQuest, IQuestDetails, IGeneratedQuestData, IQuestProgress } from '../interfaces/quest.interfaces';

@Injectable()
export class QuestsService {
  constructor(
    private supabaseService: SupabaseService,
    private openAiService: OpenAiService,
  ) {}

  /**
   * Получение всех квестов
   */
  async findAll(userId?: string): Promise<IQuest[]> {
    const query = this.supabaseService.client
      .from('quests')
      .select('*')
      .order('created_at', { ascending: false });

    // Если указан userId, получаем только квесты этого пользователя
    if (userId) {
      query.eq('user_id', userId);
    } else {
      // Иначе получаем только публичные квесты
      query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Ошибка при получении квестов: ${error.message}`);
    }

    return data;
  }

  /**
   * Получение квеста по ID
   */
  async findOne(id: string): Promise<IQuestDetails> {
    const { data: quest, error } = await this.supabaseService.client
      .from('quests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException(`Квест не найден: ${error.message}`);
    }

    // Получаем информацию о создателе квеста
    const { data: creator, error: creatorError } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .eq('id', quest.user_id)
      .single();

    if (creatorError) {
      throw new Error(`Ошибка при получении информации о создателе: ${creatorError.message}`);
    }

    // Получаем задачи квеста
    const { data: tasks, error: tasksError } = await this.supabaseService.client
      .from('quest_tasks')
      .select('*')
      .eq('quest_id', id)
      .order('order_num');

    if (tasksError) {
      throw new Error(`Ошибка при получении задач квеста: ${tasksError.message}`);
    }

    // Рассчитываем количество дней с момента создания
    const createdDays = Math.floor((Date.now() - new Date(quest.created_at).getTime()) / (1000 * 60 * 60 * 24));

    // Формируем полную структуру IQuestDetails
    const questDetails: IQuestDetails = {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      createdAt: quest.created_at,
      isPublic: quest.is_public,
      progress: 0, // Будет рассчитан позже
      questType: quest.quest_type || 'adventure',
      createdDays,
      stages: quest.content?.stages || [],
      currentStage: quest.content?.currentStage || 0,
      activeTaskId: quest.content?.activeTaskId || '',
      rewards: quest.content?.rewards || {
        xp: 100,
        gold: 50,
        itemName: 'Награда за квест'
      },
      subtasks: tasks?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        completed: false,
        xp: task.xp,
        progress: 0,
        reward: task.xp > 0 ? `${task.xp} XP` : undefined
      })) || [],
      achievements: quest.content?.achievements || [],
      stats: {
        completion: 0,
        tasksCompleted: 0,
        totalTasks: tasks?.length || 0,
        artifactsFound: 0,
        totalArtifacts: quest.content?.totalArtifacts || 0,
        xpEarned: 0,
        totalXp: quest.content?.totalXp || 100,
        timeInvested: '0 ч 0 мин'
      },
      user: {
        level: creator.level,
        levelProgress: this.calculateLevelProgress(creator.xp, creator.level),
        xpNeeded: this.getXpForLevel(creator.level),
        name: creator.name,
        questsCreated: creator.quests_created,
        questsCompleted: creator.quests_completed,
        successRate: creator.quests_completed > 0 
          ? Math.round((creator.quests_completed / (creator.quests_created || 1)) * 100) 
          : 0
      }
    };

    return questDetails;
  }

  /**
   * Создание нового квеста
   */
  async create(questData: CreateQuestDto): Promise<IQuest> {
    // Преобразуем названия полей в snake_case для БД
    const dbQuestData = {
      title: questData.title,
      description: questData.description,
      content: questData.content,
      user_id: questData.user_id,
      is_public: questData.isPublic || false
    };
    
    const { data, error } = await this.supabaseService.client
      .from('quests')
      .insert(dbQuestData)
      .select()
      .single();

    if (error) {
      throw new Error(`Ошибка при создании квеста: ${error.message}`);
    }

    return data;
  }

  /**
   * Генерация нового квеста с помощью OpenAI
   * @param userId ID пользователя, создающего квест
   * @param params Параметры генерации квеста
   */
  async generateQuest(userId: string, params: GenerateQuestDto): Promise<IGeneratedQuestData> {
    // Параметры для генерации квеста
    const { theme, difficulty, length, additionalDetails } = params;

    // Генерируем квест с помощью OpenAI
    const questContent = await this.openAiService.generateQuest({
      theme,
      complexity: difficulty, // Используем difficulty вместо complexity
      length
      // Дополнительные параметры можно добавить позже при необходимости
    });
    
    // Если есть дополнительные детали, можно их обработать дополнительно
    // или модифицировать сгенерированный контент

    // Создаем новый квест в базе данных
    const newQuest = await this.create({
      title: questContent.title,
      description: questContent.description,
      content: questContent,
      user_id: userId,
      isPublic: false, // По умолчанию квест приватный
    });

    // Преобразуем данные в формат IGeneratedQuestData
    return {
      id: newQuest.id,
      title: newQuest.title,
      description: newQuest.description,
      questType: questContent.questType || 'adventure',
      difficulty: difficulty,
      tasks: questContent.tasks || [],
      rewards: {
        xp: questContent.rewards?.xp || 100,
        itemName: questContent.rewards?.itemName || 'Награда за квест'
      }
    };
  }

  /**
   * Генерация пробного квеста без авторизации
   * @param params Параметры генерации квеста
   */
  async generateTrialQuest(params: GenerateQuestDto): Promise<IGeneratedQuestData> {
    // Параметры для генерации квеста
    const { theme, difficulty, length, additionalDetails } = params;

    // Генерируем квест с помощью OpenAI
    const questContent = await this.openAiService.generateQuest({
      theme,
      complexity: difficulty,
      length
    });

    // Создаем временный ID для пробного квеста
    const trialQuestId = `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Преобразуем данные в формат IGeneratedQuestData
    return {
      id: trialQuestId,
      title: questContent.title,
      description: questContent.description,
      questType: questContent.questType || 'adventure',
      difficulty: difficulty,
      tasks: questContent.tasks || [],
      rewards: {
        xp: questContent.rewards?.xp || 100,
        itemName: questContent.rewards?.itemName || 'Награда за квест'
      }
    };
  }

  /**
   * Обновление квеста
   */
  async update(id: string, questData: UpdateQuestDto) {
    const { data, error } = await this.supabaseService.client
      .from('quests')
      .update(questData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Ошибка при обновлении квеста: ${error.message}`);
    }

    return data;
  }

  /**
   * Удаление квеста
   */
  async remove(id: string) {
    const { error } = await this.supabaseService.client
      .from('quests')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Ошибка при удалении квеста: ${error.message}`);
    }

    return { success: true };
  }
  
  /**
   * Обновление прогресса выполнения квеста
   * @param id ID квеста
   * @param userId ID пользователя
   * @param progressData Данные прогресса
   */
  async updateProgress(id: string, userId: string, progressData: UpdateQuestProgressDto): Promise<IQuestProgress> {
    // Проверяем существование квеста
    const { data: quest, error: questError } = await this.supabaseService.client
      .from('quests')
      .select('id')
      .eq('id', id)
      .single();
      
    if (questError || !quest) {
      throw new NotFoundException(`Квест с ID ${id} не найден`);
    }
    
    // Обновляем статус задачи
    const { data: task, error: taskError } = await this.supabaseService.client
      .from('quest_tasks')
      .select('xp')
      .eq('id', progressData.taskId)
      .eq('quest_id', id)
      .single();
      
    if (taskError || !task) {
      throw new NotFoundException(`Задача с ID ${progressData.taskId} не найдена`);
    }
    
    // Обновляем прогресс пользователя по задаче
    const { error: updateError } = await this.supabaseService.client
      .from('user_task_progress')
      .upsert({
        task_id: progressData.taskId,
        user_id: userId,
        completed: progressData.completed,
        progress: progressData.progress || (progressData.completed ? 100 : 0),
        completed_at: progressData.completed ? new Date().toISOString() : null
      });
      
    if (updateError) {
      throw new Error(`Ошибка при обновлении прогресса: ${updateError.message}`);
    }
    
    // Рассчитываем общий прогресс квеста
    // Сначала получаем все задачи квеста
    const { data: questTasks } = await this.supabaseService.client
      .from('quest_tasks')
      .select('id')
      .eq('quest_id', id);
      
    // Затем получаем прогресс по этим задачам для данного пользователя
    const { data: tasksProgress, error: progressError } = await this.supabaseService.client
      .from('user_task_progress')
      .select('completed, progress')
      .eq('user_id', userId)
      .in('task_id', questTasks?.map(task => task.id) || []);
        
    if (progressError) {
      throw new Error(`Ошибка при получении прогресса задач: ${progressError.message}`);
    }
    
    // Рассчитываем общий прогресс квеста
    const totalTasks = questTasks?.length || 0;
    const completedTasks = tasksProgress?.filter(t => t.completed).length || 0;
    
    let questProgress = 0;
    if (totalTasks > 0) {
      if (tasksProgress && tasksProgress.length > 0) {
        const avgProgress = tasksProgress.reduce((sum, task) => sum + task.progress, 0) / totalTasks;
        questProgress = Math.round(avgProgress);
      }
    }
    
    // Обновляем общий прогресс квеста
    await this.supabaseService.client
      .from('quest_completions')
      .upsert({
        quest_id: id,
        user_id: userId,
        progress: questProgress,
        completed_at: questProgress >= 100 ? new Date().toISOString() : null
      });

    // Если задача завершена, обновляем XP пользователя
    if (progressData.completed) {
      await this.updateUserXp(userId, task.xp);
    }
      
    return {
      questProgress,
      taskCompleted: progressData.completed,
      xpEarned: progressData.completed ? task.xp : 0
    };
  }
  
  /**
   * Публикация квеста
   * @param id ID квеста
   * @param userId ID пользователя
   * @param publishData Данные публикации
   */
  async publishQuest(id: string, userId: string, publishData: PublishQuestDto) {
    // Проверяем, что квест принадлежит пользователю
    const { data: quest, error: questError } = await this.supabaseService.client
      .from('quests')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
      
    if (questError || !quest) {
      throw new NotFoundException(`Квест с ID ${id} не найден или вы не являетесь его владельцем`);
    }
    
    // Обновляем статус публикации
    const { data, error } = await this.supabaseService.client
      .from('quests')
      .update({
        is_public: publishData.isPublic,
        published_at: publishData.isPublic ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select('id, is_public, published_at')
      .single();
      
    if (error) {
      throw new Error(`Ошибка при публикации квеста: ${error.message}`);
    }
    
    return {
      id: data.id,
      isPublic: data.is_public,
      publishedAt: data.published_at
    };
  }
  
  /**
   * Получение списка достижений для конкретного квеста
   * @param id ID квеста
   * @param userId ID пользователя
   */
  async getAchievements(id: string, userId: string) {
    // Проверяем доступ к квесту (либо публичный, либо принадлежит пользователю)
    const { data: quest, error } = await this.supabaseService.client
      .from('quests')
      .select('content, is_public, user_id')
      .eq('id', id)
      .single();
      
    if (error || !quest) {
      throw new NotFoundException(`Квест с ID ${id} не найден`);
    }
    
    // Проверяем права доступа к квесту
    if (!quest.is_public && quest.user_id !== userId) {
      throw new NotFoundException(`У вас нет доступа к этому квесту`);
    }
    
    // Извлекаем достижения из контента квеста
    const achievements = quest.content?.achievements || [];
    
    // Получаем информацию о прогрессе пользователя по этому квесту
    const { data: progress } = await this.supabaseService.client
      .from('quest_completions')
      .select('*')
      .eq('quest_id', id)
      .eq('user_id', userId)
      .single();
      
    return achievements.map((achievement: { id: string; title: string; description: string; unlocked?: boolean }) => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      unlocked: progress ? achievement.unlocked || false : false
    }));
  }

  /**
   * Обновление опыта пользователя
   * @param userId ID пользователя
   * @param xpToAdd Количество опыта для добавления
   */
  private async updateUserXp(userId: string, xpToAdd: number): Promise<void> {
    // Получаем текущий профиль пользователя
    const { data: profile, error: profileError } = await this.supabaseService.client
      .from('profiles')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error(`Ошибка при получении профиля пользователя: ${profileError.message}`);
    }

    const newXp = profile.xp + xpToAdd;
    let newLevel = profile.level;

    // Проверяем, нужно ли повысить уровень
    while (newXp >= this.getXpForLevel(newLevel)) {
      newLevel++;
    }

    // Обновляем профиль пользователя
    const { error: updateError } = await this.supabaseService.client
      .from('profiles')
      .update({
        xp: newXp,
        level: newLevel
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Ошибка при обновлении опыта пользователя: ${updateError.message}`);
    }
  }

  /**
   * Расчет необходимого опыта для достижения определенного уровня
   */
  private getXpForLevel(level: number): number {
    // Простая формула: каждый уровень требует level * 100 опыта
    return level * 100;
  }
  
  /**
   * Проверка количества созданных пробных квестов по IP-адресу
   * @param ipAddress IP-адрес пользователя
   * @returns Объект с информацией о количестве созданных квестов и лимите
   */
  async checkTrialQuestsLimit(ipAddress: string): Promise<{ 
    canCreate: boolean; 
    questsCreated: number; 
    maxTrialQuests: number; 
    reason?: string; 
  }> {
    // Максимальное количество квестов для неавторизованных пользователей
    const MAX_TRIAL_QUESTS = 5; // Увеличено с 2 до 5 в соответствии с требованием
    
    try {
      // Используем сервисную роль Supabase для доступа к защищенной таблице
      const { data, error } = await this.supabaseService.adminClient
        .from('trial_quests_usage')
        .select('quests_created, created_at, last_quest_at')
        .eq('ip_address', ipAddress)
        .single();
        
      // Если записи нет, значит это первый квест пользователя
      if (error || !data) {
        return { canCreate: true, questsCreated: 0, maxTrialQuests: MAX_TRIAL_QUESTS };
      }
      
      // Проверяем, не превышен ли лимит суммарного количества
      const questsCreated = data.quests_created;
      if (questsCreated >= MAX_TRIAL_QUESTS) {
        return { 
          canCreate: false, 
          questsCreated, 
          maxTrialQuests: MAX_TRIAL_QUESTS,
          reason: 'max_total_exceeded'
        };
      }
      
      // Проверяем ограничение на частоту запросов в минуту
      const minuteRateLimit = await this.checkMinuteRateLimit(ipAddress);
      if (!minuteRateLimit.canCreate) {
        return { 
          canCreate: false, 
          questsCreated, 
          maxTrialQuests: MAX_TRIAL_QUESTS,
          reason: 'minute_rate_exceeded'
        };
      }
      
      // Проверяем ограничение на частоту запросов в час
      const hourRateLimit = await this.checkHourRateLimit(ipAddress);
      if (!hourRateLimit.canCreate) {
        return { 
          canCreate: false, 
          questsCreated, 
          maxTrialQuests: MAX_TRIAL_QUESTS,
          reason: 'hour_rate_exceeded'
        };
      }
      
      return { 
        canCreate: true, 
        questsCreated, 
        maxTrialQuests: MAX_TRIAL_QUESTS
      };
    } catch (err) {
      console.error('Ошибка при проверке лимита пробных квестов:', err);
      // В случае ошибки возвращаем безопасное значение - разрешаем создание
      return { canCreate: true, questsCreated: 0, maxTrialQuests: MAX_TRIAL_QUESTS };
    }
  }
  
  /**
   * Проверка лимита запросов в минуту (не более 3 запросов в минуту)
   * @param ipAddress IP-адрес пользователя
   * @returns Объект с информацией о возможности создания
   */
  async checkMinuteRateLimit(ipAddress: string): Promise<{ canCreate: boolean; requestsInLastMinute: number }> {
    try {
      const MAX_REQUESTS_PER_MINUTE = 3;
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000); // 1 минута назад
      
      // Получаем записи за последнюю минуту
      const { data, error } = await this.supabaseService.adminClient
        .from('quest_rate_limits')
        .select('created_at')
        .eq('ip_address', ipAddress)
        .gte('created_at', oneMinuteAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Ошибка при проверке лимита запросов в минуту:', error);
        // В случае ошибки разрешаем запрос
        return { canCreate: true, requestsInLastMinute: 0 };
      }
      
      const requestsInLastMinute = data?.length || 0;
      return {
        canCreate: requestsInLastMinute < MAX_REQUESTS_PER_MINUTE,
        requestsInLastMinute
      };
    } catch (err) {
      console.error('Ошибка при проверке лимита запросов в минуту:', err);
      // В случае ошибки разрешаем запрос
      return { canCreate: true, requestsInLastMinute: 0 };
    }
  }
  
  /**
   * Проверка лимита запросов в час (не более 20 запросов в час)
   * @param ipAddress IP-адрес пользователя
   * @returns Объект с информацией о возможности создания
   */
  async checkHourRateLimit(ipAddress: string): Promise<{ canCreate: boolean; requestsInLastHour: number }> {
    try {
      const MAX_REQUESTS_PER_HOUR = 20;
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 час назад
      
      // Получаем записи за последний час
      const { data, error } = await this.supabaseService.adminClient
        .from('quest_rate_limits')
        .select('created_at')
        .eq('ip_address', ipAddress)
        .gte('created_at', oneHourAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Ошибка при проверке лимита запросов в час:', error);
        // В случае ошибки разрешаем запрос
        return { canCreate: true, requestsInLastHour: 0 };
      }
      
      const requestsInLastHour = data?.length || 0;
      return {
        canCreate: requestsInLastHour < MAX_REQUESTS_PER_HOUR,
        requestsInLastHour
      };
    } catch (err) {
      console.error('Ошибка при проверке лимита запросов в час:', err);
      // В случае ошибки разрешаем запрос
      return { canCreate: true, requestsInLastHour: 0 };
    }
  }
  
  /**
   * Регистрирует попытку создания квеста для отслеживания частоты запросов
   * @param ipAddress IP-адрес пользователя
   * @returns true если запись успешно создана
   */
  async recordQuestAttempt(ipAddress: string): Promise<boolean> {
    try {
      // Регистрируем попытку создания квеста
      const { error } = await this.supabaseService.adminClient
        .from('quest_rate_limits')
        .insert({ 
          ip_address: ipAddress, 
          created_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error('Ошибка при регистрации попытки создания квеста:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Ошибка при регистрации попытки создания квеста:', err);
      return false;
    }
  }
  
  /**
   * Увеличивает счетчик созданных пробных квестов для IP-адреса
   * @param ipAddress IP-адрес пользователя
   * @returns Обновленное количество созданных квестов
   */
  async incrementTrialQuestsCount(ipAddress: string): Promise<number> {
    try {
      // Используем сервисную роль Supabase для доступа к защищенной таблице
      const now = new Date().toISOString();
      
      // Используем upsert для атомарного обновления или вставки записи
      const { data, error } = await this.supabaseService.adminClient
        .rpc('upsert_trial_usage', { 
          p_ip_address: ipAddress,
          p_last_quest_at: now
        });

      if (error) {
        console.error('Ошибка при вызове upsert_trial_usage:', error);
        
        // Если RPC функция не существует, используем альтернативный подход с upsert
        const { data: upsertData, error: upsertError } = await this.supabaseService.adminClient
          .from('trial_quests_usage')
          .upsert({
            ip_address: ipAddress,
            quests_created: 1,  // Будет использовано только при создании новой записи
            first_quest_at: now,
            last_quest_at: now
          }, {
            onConflict: 'ip_address', // В случае конфликта по ip_address
            ignoreDuplicates: false    // Не игнорировать дубликаты
          });

        if (upsertError) {
          throw new Error(`Ошибка при обновлении счетчика пробных квестов: ${upsertError.message}`);
        }
        
        // После upsert нам нужно обновить счетчик для существующих записей
        const { data: record, error: selectError } = await this.supabaseService.adminClient
          .from('trial_quests_usage')
          .select('quests_created')
          .eq('ip_address', ipAddress)
          .single();

        if (selectError || !record) {
          throw new Error(`Не удалось получить запись после upsert: ${selectError?.message || 'запись не найдена'}`);
        }

        if (record.quests_created <= 1) {
          // Это новая запись или квест уже был учтен
          return record.quests_created;
        }

        // Увеличиваем счетчик и обновляем время последнего квеста
        const { data: updatedData, error: updateError } = await this.supabaseService.adminClient
          .from('trial_quests_usage')
          .update({ 
            quests_created: record.quests_created + 1,
            last_quest_at: now 
          })
          .eq('ip_address', ipAddress)
          .select('quests_created')
          .single();

        if (updateError) {
          throw new Error(`Ошибка при обновлении счетчика: ${updateError.message}`);
        }

        return updatedData.quests_created;
      } else {
        // RPC функция успешно выполнена, возвращаем результат
        return data;
      }
    } catch (err) {
      console.error('Ошибка при обновлении счетчика пробных квестов:', err);
      // В случае ошибки вернем 1, чтобы не блокировать создание квеста
      return 1;
    }
  }

  /**
   * Вспомогательный метод для расчета прогресса уровня
   */
  private calculateLevelProgress(currentXp: number, level: number): number {
    const xpForCurrentLevel = this.getXpForLevel(level - 1);
    const xpForNextLevel = this.getXpForLevel(level);
    const xpInCurrentLevel = currentXp - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    
    return Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
  }

  /**
   * Генерация контента для квеста (этапы, задачи, достижения)
   * @param generateContentDto Параметры для генерации контента
   * @returns Сгенерированный контент в зависимости от запрошенного типа
   */
  async generateContent(generateContentDto: GenerateContentDto) {
    const { description, title, questType, contentType } = generateContentDto;
    
    try {
      switch (contentType) {
        case 'stages':
          return await this.generateStagesContent(description, title, questType);
        case 'tasks':
          return await this.generateTasksContent(description, title, questType);
        case 'achievements':
          return await this.generateAchievementsContent(description, title, questType);
        default:
          throw new Error(`Неподдерживаемый тип контента: ${contentType}`);
      }
    } catch (error) {
      console.error(`Ошибка при генерации контента типа ${contentType}:`, error);
      // Правильная обработка ошибки с проверкой типа
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(`Не удалось сгенерировать контент: ${errorMessage}`);
    }
  }

  /**
   * Генерация этапов квеста
   * @private
   */
  private async generateStagesContent(description: string, title: string, questType: string) {
    // Формируем промпт для OpenAI
    const prompt = `Создай 3-5 этапов для квеста "${title}" с описанием "${description}".
      Тип квеста: ${questType}.
      Каждый этап должен иметь название, описание и список из 2-3 задач.
      Формат JSON: { stages: [{ title: string, description: string, tasks: [{ title: string, description: string, xp: number }] }] }`;
    
    // Вызываем OpenAI для генерации контента
    const content = await this.openAiService.generateQuestContent(prompt);
    
    // Парсим и проверяем результат
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent;
    } catch (e) {
      console.error('Ошибка при парсинге сгенерированных этапов:', e, content);
      throw new Error('Не удалось обработать сгенерированные этапы');
    }
  }

  /**
   * Генерация задач квеста
   * @private
   */
  private async generateTasksContent(description: string, title: string, questType: string) {
    // Формируем промпт для OpenAI
    const prompt = `Создай 5-7 задач для квеста "${title}" с описанием "${description}".
      Тип квеста: ${questType}.
      Каждая задача должна иметь название, описание и количество опыта (XP) за выполнение.
      Формат JSON: { tasks: [{ title: string, description: string, xp: number }] }`;
    
    // Вызываем OpenAI для генерации контента
    const content = await this.openAiService.generateQuestContent(prompt);
    
    // Парсим и проверяем результат
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent;
    } catch (e) {
      console.error('Ошибка при парсинге сгенерированных задач:', e, content);
      throw new Error('Не удалось обработать сгенерированные задачи');
    }
  }

  /**
   * Генерация достижений квеста
   * @private
   */
  private async generateAchievementsContent(description: string, title: string, questType: string) {
    // Формируем промпт для OpenAI
    const prompt = `Создай 3-5 достижений для квеста "${title}" с описанием "${description}".
      Тип квеста: ${questType}.
      Каждое достижение должно иметь название, описание, условие получения и награду (XP).
      Формат JSON: { achievements: [{ title: string, description: string, condition: string, xp: number }] }`;
    
    // Вызываем OpenAI для генерации контента
    const content = await this.openAiService.generateQuestContent(prompt);
    
    // Парсим и проверяем результат
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent;
    } catch (e) {
      console.error('Ошибка при парсинге сгенерированных достижений:', e, content);
      throw new Error('Не удалось обработать сгенерированные достижения');
    }
  }
}
