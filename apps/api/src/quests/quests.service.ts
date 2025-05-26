import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { OpenAiService } from '../openai/openai.service';
import { CreateQuestDto, UpdateQuestDto, GenerateQuestDto, UpdateQuestProgressDto, PublishQuestDto } from './dto';
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
    const { data, error } = await this.supabaseService.client
      .from('quests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Квест не найден: ${error.message}`);
    }

    return data;
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
        user_id: userId, // Используем реальный ID пользователя из контекста запроса
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
      
    // Затем получаем прогресс по этим задачам
    const { data: tasksProgress, error: progressError } = await this.supabaseService.client
      .from('user_task_progress')
      .select('completed, progress')
      .eq('user_id', 'user_id_placeholder')
      .in('task_id', questTasks?.map(task => task.id) || []);
        
    if (progressError) {
      throw new Error(`Ошибка при получении прогресса задач: ${progressError.message}`);
    }
    
    // Рассчитываем общий прогресс квеста
    const totalTasks = tasksProgress.length;
    const completedTasks = tasksProgress.filter(t => t.completed).length;
    const avgProgress = tasksProgress.reduce((sum, task) => sum + task.progress, 0) / totalTasks;
    const questProgress = Math.round(avgProgress);
    
    // Обновляем общий прогресс квеста
    await this.supabaseService.client
      .from('quest_completions')
      .upsert({
        quest_id: id,
        user_id: 'user_id_placeholder', // здесь должен быть реальный ID пользователя из контекста запроса
        progress: questProgress,
        completed_at: questProgress >= 100 ? new Date().toISOString() : null
      });
      
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
      
    return achievements.map((achievement: any) => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      unlocked: progress ? achievement.unlocked || false : false
    }));
  }
}
