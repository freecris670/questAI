import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UserProfileDto, UserStatsDto } from './dto';
import { IQuest } from '../interfaces/quest.interfaces';
import { IUserProfile, IUserStats, IUserSubscription } from '../interfaces/user.interfaces';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Получение профиля пользователя
   */
  async getUserProfile(userId: string): Promise<IUserProfile> {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new NotFoundException(`Профиль пользователя не найден: ${error.message}`);
    }

    // Получаем дополнительную статистику
    const stats = await this.getUserStats(userId);

    return {
      id: data.id,
      name: data.name,
      level: data.level,
      levelProgress: this.calculateLevelProgress(data.xp, data.level),
      xpNeeded: this.calculateXpNeeded(data.level),
      questsCreated: stats.questsCreated,
      questsCompleted: stats.questsCompleted,
      successRate: stats.successRate
    };
  }

  /**
   * Обновление профиля пользователя
   */
  async updateUserProfile(
    userId: string,
    profileData: Partial<{
      name: string;
      username: string;
      full_name: string;
      avatar_url: string;
    }>,
  ): Promise<IUserProfile> {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Ошибка при обновлении профиля: ${error.message}`);
    }

    return this.getUserProfile(userId);
  }

  /**
   * Получение статистики пользователя
   */
  async getUserStats(userId: string): Promise<IUserStats> {
    // Получаем профиль пользователя
    const { data: profile, error: profileError } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new NotFoundException(`Профиль пользователя не найден: ${profileError.message}`);
    }

    // Получаем количество созданных квестов
    const { count: questsCreated, error: questsError } = await this.supabaseService.client
      .from('quests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (questsError) {
      throw new Error(`Ошибка при получении статистики квестов: ${questsError.message}`);
    }

    // Получаем количество завершенных квестов
    const { count: questsCompleted, error: completionsError } = await this.supabaseService.client
      .from('quest_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    if (completionsError) {
      throw new Error(`Ошибка при получении статистики прохождений: ${completionsError.message}`);
    }

    // Получаем общее количество начатых квестов для расчета успешности
    const { count: totalStarted, error: totalError } = await this.supabaseService.client
      .from('quest_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (totalError) {
      throw new Error(`Ошибка при получении общей статистики: ${totalError.message}`);
    }

    const successRate = totalStarted && totalStarted > 0 
      ? Math.round(((questsCompleted || 0) / totalStarted) * 100) 
      : 0;

    return {
      level: profile.level,
      levelProgress: this.calculateLevelProgress(profile.xp, profile.level),
      xpNeeded: this.calculateXpNeeded(profile.level),
      name: profile.name,
      questsCreated: questsCreated || 0,
      questsCompleted: questsCompleted || 0,
      successRate
    };
  }

  /**
   * Получение подписки пользователя
   */
  async getUserSubscription(userId: string): Promise<IUserSubscription | null> {
    const { data, error } = await this.supabaseService.client
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 - нет данных
      throw new Error(`Ошибка при получении подписки: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      planName: data.subscription_plans.name,
      isActive: data.active,
      expiresAt: data.expires_at,
      features: data.subscription_plans.features || []
    };
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
   * Вспомогательный метод для расчета необходимого опыта до следующего уровня
   */
  private calculateXpNeeded(level: number): number {
    const xpForNextLevel = this.getXpForLevel(level);
    return xpForNextLevel;
  }

  /**
   * Расчет необходимого опыта для достижения определенного уровня
   */
  private getXpForLevel(level: number): number {
    // Простая формула: каждый уровень требует level * 100 опыта
    return level * 100;
  }
}
