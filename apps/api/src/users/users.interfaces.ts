/**
 * Интерфейсы для модуля пользователей
 */

export interface IUserProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface IUpdateProfileDto {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface IUserStats {
  quests_created: number;
  quests_completed: number;
}

export interface ISubscription {
  id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ISubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: {
    quests_per_month: number;
    ai_generations: number;
    priority_support?: boolean;
    early_access?: boolean;
  };
}
