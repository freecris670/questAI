import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { QuestsService } from '../quests/quests.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private questsService: QuestsService,
    private usersService: UsersService,
  ) {}

  /**
   * Авторизация пользователя
   */
  async login(loginDto: LoginDto, ipAddress: string): Promise<AuthResponseDto> {
    try {
      // Авторизация через Supabase
      const { data, error } = await this.supabaseService.client.auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (error) {
        throw new UnauthorizedException(`Ошибка авторизации: ${error.message}`);
      }

      // Получаем данные пользователя
      const userId = data.user.id;
      const userData = await this.usersService.getUserProfile(userId);

      // Мигрируем пробные квесты
      await this.migrateTrialQuests(ipAddress, userId);

      return {
        token: data.session.access_token,
        user: {
          id: userId,
          email: data.user.email,
          name: userData.name,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
  }

  /**
   * Регистрация нового пользователя
   */
  async register(registerDto: RegisterDto, ipAddress: string): Promise<AuthResponseDto> {
    try {
      // Регистрация через Supabase
      const { data, error } = await this.supabaseService.client.auth.signUp({
        email: registerDto.email,
        password: registerDto.password,
        options: {
          data: {
            name: registerDto.name,
          },
        },
      });

      if (error) {
        throw new BadRequestException(`Ошибка регистрации: ${error.message}`);
      }

      if (!data.user) {
        throw new BadRequestException('Не удалось создать пользователя');
      }

      const userId = data.user.id;

      // Создаем запись в profiles, если пользователь подтвердил email сразу
      if (data.user.confirmed_at) {
        await this.usersService.updateUserProfile(userId, {
          name: registerDto.name,
        });
      }

      // Мигрируем пробные квесты
      if (data.session) {
        await this.migrateTrialQuests(ipAddress, userId);
      }

      return {
        token: data.session?.access_token || '',
        user: {
          id: userId,
          email: data.user.email,
          name: registerDto.name,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при регистрации пользователя');
    }
  }

  /**
   * Проверка JWT токена
   */
  async validateToken(token: string): Promise<{ userId: string } | null> {
    try {
      const userId = await this.supabaseService.getUserIdFromToken(token);
      return { userId };
    } catch (error) {
      return null;
    }
  }

  /**
   * Миграция пробных квестов
   */
  async migrateTrialQuests(ipAddress: string, userId: string): Promise<{ migrated: number }> {
    try {
      const result = await this.questsService.migrateTrialQuests(ipAddress, userId);
      return { migrated: result.migrated };
    } catch (error) {
      console.error('Ошибка при миграции пробных квестов:', error);
      // Не выбрасываем исключение, чтобы не блокировать процесс авторизации
      return { migrated: 0 };
    }
  }
}
