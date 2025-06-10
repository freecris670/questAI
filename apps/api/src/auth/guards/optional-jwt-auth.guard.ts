import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Всегда разрешаем доступ, но пытаемся проверить токен если он есть
    try {
      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return result.catch(() => true);
      }
      return true;
    } catch {
      return true;
    }
  }

  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    // В отличие от обычного JwtAuthGuard, не бросаем ошибку если пользователь не найден
    // Просто возвращаем null
    return user || null;
  }
} 