import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'global',  // Глобальный лимит для всех запросов
        ttl: 60000,      // 1 минута
        limit: 100,      // Максимум 100 запросов в минуту
      },
      {
        name: 'short',  // Для частых ограничений (в минуту)
        ttl: 60000,     // 1 минута
        limit: 3,       // 3 запроса в минуту для генерации квестов
      },
      {
        name: 'medium', // Для средних ограничений (в час)
        ttl: 3600000,   // 1 час
        limit: 20,      // 20 запросов в час для генерации квестов
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [ThrottlerModule],
})
export class ThrottlerConfigModule {}
