import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Отсутствует токен авторизации');
    }

    try {
      const userId = await this.supabaseService.getUserIdFromToken(authHeader);
      
      // Добавляем ID пользователя в запрос для использования в контроллерах
      request.user = { id: userId };
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Ошибка аутентификации');
    }
  }
}
