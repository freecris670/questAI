import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { OpenAiService } from '../openai/openai.service';
import { CreateQuestDto, UpdateQuestDto, GenerateQuestDto } from './quests.interfaces';

@Injectable()
export class QuestsService {
  constructor(
    private supabaseService: SupabaseService,
    private openAiService: OpenAiService,
  ) {}

  /**
   * Получение всех квестов
   */
  async findAll(userId?: string) {
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
  async findOne(id: string) {
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
  async create(questData: CreateQuestDto) {
    const { data, error } = await this.supabaseService.client
      .from('quests')
      .insert(questData)
      .select()
      .single();

    if (error) {
      throw new Error(`Ошибка при создании квеста: ${error.message}`);
    }

    return data;
  }

  /**
   * Генерация нового квеста с помощью OpenAI
   */
  async generateQuest(params: GenerateQuestDto) {
    const { theme, complexity, length, userId } = params;

    // Генерируем квест с помощью OpenAI
    const questContent = await this.openAiService.generateQuest({
      theme,
      complexity,
      length,
    });

    // Создаем новый квест в базе данных
    const newQuest = await this.create({
      title: questContent.title,
      description: questContent.description,
      content: questContent,
      user_id: userId,
      is_public: false, // По умолчанию квест приватный
    });

    return newQuest;
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
}
