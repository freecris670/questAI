# Интеграция с Supabase

В этом документе описаны компоненты и методы работы с Supabase в проекте QuestAI.

## Конфигурация

Для работы с Supabase необходимо настроить следующие переменные окружения:

```
SUPABASE_URL=https://your-project-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## Использование в контроллерах

### Защита маршрутов с помощью SupabaseAuthGuard

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard, User } from '../supabase/supabase.module';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(SupabaseAuthGuard) // Защита маршрута - требуется токен Supabase
  async getProfile(@User('id') userId: string) {
    return this.usersService.getProfile(userId);
  }
}
```

### Получение ID пользователя с помощью декоратора User

```typescript
@Post('quests')
@UseGuards(SupabaseAuthGuard)
async createQuest(@User('id') userId: string, @Body() createQuestDto: CreateQuestDto) {
  return this.questsService.create(userId, createQuestDto);
}
```

## Использование в сервисах

### Прямой доступ к Supabase Client

```typescript
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.module';

@Injectable()
export class QuestsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('quests')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Ошибка получения квестов: ${error.message}`);
    }

    return data;
  }
}
```

### Использование вспомогательных методов

```typescript
async getUserProfile(userId: string) {
  try {
    const profile = await this.supabaseService.getUserProfile(userId);
    return profile;
  } catch (error) {
    throw new Error(`Ошибка получения профиля: ${error.message}`);
  }
}
```

## Структура таблиц в Supabase

База данных содержит следующие основные таблицы:

1. **profiles** - профили пользователей
2. **quests** - информация о квестах
3. **quest_completions** - прогресс прохождения квестов
4. **quest_tasks** - задачи квестов
5. **user_task_progress** - прогресс пользователей по задачам
6. **subscription_plans** - планы подписки
7. **subscriptions** - подписки пользователей

Полная структура таблиц и связей описана в миграциях в директории `/supabase/migrations/`.

## Row Level Security (RLS)

Все таблицы защищены с помощью Row Level Security (RLS), что обеспечивает доступ пользователей только к своим данным.

### Пример политик RLS для таблицы quests:

- `Публичные квесты доступны всем для чтения`
- `Пользователи могут видеть свои квесты`
- `Пользователи могут создавать квесты`
- `Пользователи могут редактировать свои квесты`
- `Пользователи могут удалять свои квесты`
