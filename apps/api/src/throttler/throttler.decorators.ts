import { SetMetadata } from '@nestjs/common';

/**
 * Ключи метаданных для throttler
 */
export const THROTTLER_LIMIT = 'THROTTLER_LIMIT';
export const THROTTLER_SKIP = 'THROTTLER_SKIP';
export const THROTTLER_TTL = 'THROTTLER_TTL';

/**
 * Декоратор для настройки специфичных лимитов трафика для эндпоинтов
 * 
 * @example @ThrottleLimit(3, 60) // 3 запроса в минуту
 */
export const ThrottleLimit = (limit: number, ttl: number) =>
  SetMetadata(THROTTLER_LIMIT, { limit, ttl });

/**
 * Декоратор для отключения глобального throttling и применения собственных правил
 */
export const SkipThrottleCheck = () => SetMetadata(THROTTLER_SKIP, true);

/**
 * Декоратор для ограничения запросов пробных пользователей (неавторизованных)
 * 3 запроса в минуту, 20 в час
 */
export const TrialUserRateLimit = () =>
  SetMetadata(THROTTLER_LIMIT, [
    { name: 'short', limit: 3, ttl: 60000 },    // 3 запроса в минуту
    { name: 'medium', limit: 20, ttl: 3600000 } // 20 запросов в час
  ]);

/**
 * Декоратор для ограничения запросов авторизованных пользователей базового тарифа
 * 10 запросов в минуту, 100 в час
 */
export const FreeUserRateLimit = () =>
  SetMetadata(THROTTLER_LIMIT, [
    { name: 'short', limit: 10, ttl: 60000 },    // 10 запросов в минуту
    { name: 'medium', limit: 100, ttl: 3600000 } // 100 запросов в час
  ]);

/**
 * Декоратор для ограничения запросов премиум пользователей
 * 20 запросов в минуту, 200 в час
 */
export const PremiumUserRateLimit = () =>
  SetMetadata(THROTTLER_LIMIT, [
    { name: 'short', limit: 20, ttl: 60000 },    // 20 запросов в минуту
    { name: 'medium', limit: 200, ttl: 3600000 } // 200 запросов в час
  ]);

/**
 * Декоратор для ограничения запросов к внешним API (OpenAI)
 * 5 запросов в минуту, 50 в час
 */
export const ExternalApiRateLimit = () =>
  SetMetadata(THROTTLER_LIMIT, [
    { name: 'short', limit: 5, ttl: 60000 },    // 5 запросов в минуту
    { name: 'medium', limit: 50, ttl: 3600000 } // 50 запросов в час
  ]);
