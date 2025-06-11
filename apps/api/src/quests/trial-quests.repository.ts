import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

// Предполагаемая структура данных пробного квеста
interface ITrialQuest {
  id: string;
  ip_address: string;
  content: any;
  created_at: string;
  title: string;
  description: string;
}

/**
 * @class TrialQuestsRepository
 * @description Репозиторий для управления сущностями пробных квестов в базе данных.
 * Инкапсулирует все запросы к таблице 'trial_quests'.
 */
@Injectable()
export class TrialQuestsRepository {
  private readonly logger = new Logger(TrialQuestsRepository.name);
  private readonly TABLE_NAME = 'trial_quests';

  constructor(private readonly supabase: SupabaseService) {}

  private get questTable() {
    return this.supabase.client.from(this.TABLE_NAME);
  }

  /**
   * Находит один пробный квест по его ID.
   * @param {string} id - ID пробного квеста.
   * @returns {Promise<ITrialQuest | null>} Объект квеста или null, если не найден.
   */
  async findById(id: string): Promise<ITrialQuest | null> {
    const { data, error } = await this.questTable.select('*').eq('id', id).single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      this.logger.error(`Error finding trial quest by id ${id}: ${error.message}`, error.stack);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Находит все пробные квесты, созданные с определенного IP-адреса.
   * @param {string} ipAddress - IP-адрес пользователя.
   * @returns {Promise<ITrialQuest[]>} Массив пробных квестов.
   */
  async findByIp(ipAddress: string): Promise<ITrialQuest[]> {
    const { data, error } = await this.questTable
      .select('*')
      .eq('ip_address', ipAddress)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`Error finding trial quests by ip ${ipAddress}: ${error.message}`, error.stack);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Создает новый пробный квест в базе данных.
   * @param {string} description - Оригинальное описание, введенное пользователем.
   * @param {string} ipAddress - IP-адрес пользователя.
   * @param {any} content - Сгенерированный AI контент квеста.
   * @returns {Promise<ITrialQuest>} Созданный объект пробного квеста.
   */
  async create(description: string, ipAddress: string, content: any): Promise<ITrialQuest> {
    const questData = {
      title: content.title || 'Новый квест',
      description: content.description || description,
      ip_address: ipAddress,
      content: content,
    };

    const { data, error } = await this.questTable.insert(questData).select().single();

    if (error) {
      this.logger.error(`Error creating trial quest for ip ${ipAddress}: ${error.message}`, error.stack);
      throw new Error(error.message);
    }
    return data;
  }
} 