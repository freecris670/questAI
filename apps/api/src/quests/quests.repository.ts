import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { IQuest, IQuestDetails } from '../interfaces/quest.interfaces';
import { CreateQuestDto, UpdateQuestDto } from './dto';

/**
 * @class QuestsRepository
 * @description Репозиторий для управления сущностями квестов в базе данных.
 * Инкапсулирует все прямые запросы к таблице 'quests' и связанным с ней таблицам.
 */
@Injectable()
export class QuestsRepository {
  private readonly logger = new Logger(QuestsRepository.name);

  constructor(private readonly supabase: SupabaseService) {}

  private get questTable() {
    return this.supabase.client.from('quests');
  }

  /**
   * Находит все публичные квесты или все квесты конкретного пользователя.
   * @param {string} [userId] - Опциональный ID пользователя. Если предоставлен, возвращает квесты этого пользователя.
   * @returns {Promise<IQuest[]>} Массив квестов.
   */
  async findAll(userId?: string): Promise<IQuest[]> {
    const query = this.questTable
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query.eq('user_id', userId);
    } else {
      query.eq('is_public', true);
    }

    const { data, error } = await query;
    if (error) {
      this.logger.error(`Error finding all quests: ${error.message}`, error.stack);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Находит один квест по его ID.
   * @param {string} id - ID квеста.
   * @returns {Promise<IQuest | null>} Объект квеста или null, если не найден.
   */
  async findById(id: string): Promise<IQuest | null> {
    const { data, error } = await this.questTable.select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') { // "Not a single row was found"
        return null;
      }
      this.logger.error(`Error finding quest by id ${id}: ${error.message}`, error.stack);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Находит детальную информацию о квесте, включая задачи и информацию о создателе.
   * @param {string} id - ID квеста.
   * @returns {Promise<IQuestDetails | null>} Детальная информация о квесте или null, если не найден.
   */
  async findQuestDetails(id: string): Promise<IQuestDetails | null> {
    const { data: quest, error } = await this.questTable.select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      this.logger.error(`Error finding quest details for id ${id}: ${error.message}`, error.stack);
      throw new Error(error.message);
    }

    const { data: creator, error: creatorError } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', quest.user_id)
      .single();
    if (creatorError) {
      this.logger.error(`Error finding creator for quest ${id}: ${creatorError.message}`, creatorError.stack);
      throw new Error(creatorError.message);
    }

    const { data: tasks, error: tasksError } = await this.supabase.client
      .from('quest_tasks')
      .select('*')
      .eq('quest_id', id)
      .order('order_num');
    if (tasksError) {
      this.logger.error(`Error finding tasks for quest ${id}: ${tasksError.message}`, tasksError.stack);
      throw new Error(tasksError.message);
    }
    
    const createdDays = Math.floor((Date.now() - new Date(quest.created_at).getTime()) / (1000 * 60 * 60 * 24));

    return {
      ...quest,
      progress: 0, // Will be calculated in the service layer
      questType: quest.quest_type || 'adventure',
      createdDays,
      stages: quest.content?.stages || [],
      currentStage: quest.content?.currentStage || 0,
      activeTaskId: quest.content?.activeTaskId || '',
      rewards: quest.content?.rewards || {},
      subtasks: tasks?.map(task => ({ ...task })) || [],
      creator: {
        id: creator.id,
        username: creator.username,
        avatarUrl: creator.avatar_url,
      },
      tasksCount: tasks?.length || 0,
    };
  }
  
  /**
   * Создает новый квест в базе данных.
   * @param {CreateQuestDto} questData - Данные для создания квеста.
   * @param {string} userId - ID пользователя-создателя.
   * @returns {Promise<IQuest>} Созданный объект квеста.
   */
  async create(questData: CreateQuestDto, userId: string): Promise<IQuest> {
    const { data, error } = await this.questTable
      .insert({ ...questData, user_id: userId })
      .select()
      .single();
      
    if (error) {
      this.logger.error(`Error creating quest: ${error.message}`, error.stack);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Обновляет существующий квест.
   * @param {string} id - ID квеста для обновления.
   * @param {UpdateQuestDto} questData - Новые данные для квеста.
   * @returns {Promise<IQuest>} Обновленный объект квеста.
   */
  async update(id: string, questData: UpdateQuestDto): Promise<IQuest> {
    const { data, error } = await this.questTable
      .update(questData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error updating quest ${id}: ${error.message}`, error.stack);
      throw new Error(error.message);
    }
    return data;
  }
  
  /**
   * Удаляет квест из базы данных.
   * @param {string} id - ID квеста для удаления.
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.questTable.delete().eq('id', id);
    if (error) {
      this.logger.error(`Error deleting quest ${id}: ${error.message}`, error.stack);
      throw new Error(error.message);
    }
  }
} 