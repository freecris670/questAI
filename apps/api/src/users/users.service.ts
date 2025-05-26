import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UserProfileDto, UserStatsDto } from './dto';
import { IQuest } from '../interfaces/quest.interfaces';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {/* Сервис используется в методах */}

  /**
   * Получение профиля пользователя
   */
  async getUserProfile(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Профиль не найден: ${error.message}`);
    }

    return data;
  }

  /**
   * Обновление профиля пользователя
   */
  async updateUserProfile(
    userId: string,
    profileData: Partial<{
      username: string;
      full_name: string;
      avatar_url: string;
    }>,
  ) {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Ошибка при обновлении профиля: ${error.message}`);
    }

    return data;
  }

  /**
   * Получение статистики пользователя
   */
  async getUserStats(userId: string) {
    // Получаем количество созданных квестов
    const { count: questsCount, error: questsError } = await this.supabaseService.client
      .from('quests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (questsError) {
      throw new Error(`Ошибка при получении статистики квестов: ${questsError.message}`);
    }

    // Получаем количество прохождений квестов
    const { count: completionsCount, error: completionsError } = await this.supabaseService.client
      .from('quest_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (completionsError) {
      throw new Error(`Ошибка при получении статистики прохождений: ${completionsError.message}`);
    }

    return {
      quests_created: questsCount || 0,
      quests_completed: completionsCount || 0,
    };
  }

  /**
   * Получение подписки пользователя
   */
  async getUserSubscription(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 - нет данных
      throw new Error(`Ошибка при получении подписки: ${error.message}`);
    }

    return data || { active: false, plan: 'free' };
  }
  
  /**
   * Получение списка активных квестов пользователя
   */
  async getActiveQuests(userId: string): Promise<IQuest[]> {
    // Получаем все квесты, которые пользователь начал, но не завершил
    const { data, error } = await this.supabaseService.client
      .from('quest_completions')
      .select('*, quests(*)')
      .eq('user_id', userId)
      .is('completed_at', null) // Выбираем только незавершенные квесты
      .order('started_at', { ascending: false });

    if (error) {
      throw new Error(`Ошибка при получении активных квестов: ${error.message}`);
    }
    
    // Преобразуем данные в формат IQuest
    return data.map(item => ({
      id: item.quests.id,
      title: item.quests.title,
      description: item.quests.description,
      createdAt: item.quests.created_at,
      isPublic: item.quests.is_public,
      progress: item.progress,
      questType: item.quests.quest_type || 'standard'
    }));
  }
}
