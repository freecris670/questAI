import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../interfaces/supabase.interfaces';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabaseClient!: SupabaseClient<Database>;
  private supabaseUrl!: string;
  private supabaseKey!: string;
  private supabaseJwtSecret!: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    this.supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY') || '';
    this.supabaseJwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET') || '';

    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Отсутствуют необходимые переменные окружения для Supabase');
    }

    this.supabaseClient = createClient<Database>(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Получить стандартный клиент Supabase
   */
  get client(): SupabaseClient<Database> {
    return this.supabaseClient;
  }
  
  /**
   * Получить клиент Supabase с правами сервисной роли для работы с защищенными таблицами
   * (используется для таблиц с RLS политиками, где нужна авторизация)
   */
  get adminClient(): SupabaseClient<Database> {
    return this.supabaseClient;
  }

  /**
   * Проверяет JWT токен Supabase и возвращает userId
   * @param authHeader заголовок Authorization
   * @returns id пользователя
   */
  async getUserIdFromToken(authHeader: string): Promise<string> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Некорректный формат токена');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const { data, error } = await this.supabaseClient.auth.getUser(token);
      
      if (error || !data.user) {
        throw new UnauthorizedException('Недействительный токен');
      }
      
      return data.user.id;
    } catch (error) {
      throw new UnauthorizedException('Ошибка проверки токена');
    }
  }

  /**
   * Получает профиль пользователя по ID
   * @param userId ID пользователя
   * @returns профиль пользователя
   */
  async getUserProfile(userId: string) {
    const { data, error } = await this.supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Ошибка получения профиля: ${error.message}`);
    }

    return data;
  }

  /**
   * Обновляет профиль пользователя
   * @param userId ID пользователя
   * @param profileData данные профиля
   * @returns обновленный профиль
   */
  async updateUserProfile(userId: string, profileData: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const { data, error } = await this.supabaseClient
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Ошибка обновления профиля: ${error.message}`);
    }

    return data;
  }
}
