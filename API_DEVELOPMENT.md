# Техническое описание API для backend-разработки QuestAI

На основе анализа frontend-части проекта QuestAI, ниже представлено полное техническое описание API для реализации backend-части.

## 1. Авторизация и пользователи

### 1.1. Авторизация пользователей
- **Endpoint:** `/api/auth`
- **Используется:** Supabase Auth (согласно архитектурным принципам из памяти проекта)
- **Примечание:** Интерфейсы и эндпоинты для авторизации уже интегрированы через Supabase, backend должен обеспечить корректную работу JWT-токенов и Row Level Security (RLS).

### 1.2. Профиль пользователя
- **Endpoint:** `/api/users/profile`
- **Метод:** GET
- **Описание:** Получение данных профиля авторизованного пользователя
- **Авторизация:** Bearer JWT-токен
- **Возвращаемые данные:**
```typescript
{
  id: string;
  name: string;
  level: number;
  levelProgress: number;
  xpNeeded: number;
  questsCreated: number;
  questsCompleted: number;
  successRate: number;
}
```

## 2. Работа с квестами

### 2.1. Получение списка квестов
- **Endpoint:** `/api/quests`
- **Метод:** GET
- **Описание:** Получение списка квестов с возможностью фильтрации по пользователю
- **Параметры запроса:**
  - `userId` (опционально): ID пользователя для фильтрации его квестов
- **Авторизация:** Bearer JWT-токен
- **Возвращаемые данные:**
```typescript
[
  {
    id: string;
    title: string;
    description: string;
    createdAt: string; // ISO-формат даты
    isPublic: boolean;
    progress: number; // прогресс выполнения от 0 до 100
    questType: string;
  }
]
```

### 2.2. Получение квеста по ID
- **Endpoint:** `/api/quests/{id}`
- **Метод:** GET
- **Описание:** Получение полных данных квеста по его ID
- **Параметры пути:**
  - `id`: ID квеста
- **Авторизация:** Bearer JWT-токен
- **Возвращаемые данные:** Полная структура квеста согласно интерфейсу `QuestDetails`:
```typescript
{
  id: string;
  title: string;
  questType: string;
  createdDays: number; // количество дней с момента создания
  description: string;
  progress: number; // от 0 до 100
  stages: Array<{
    name: string;
    completed: boolean;
  }>;
  currentStage: number;
  activeTaskId: string;
  rewards: {
    xp: number;
    gold: number;
    itemName: string;
  };
  subtasks: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    xp: number;
    progress: number;
    reward?: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
  }>;
  stats: {
    completion: number;
    tasksCompleted: number;
    totalTasks: number;
    artifactsFound: number;
    totalArtifacts: number;
    xpEarned: number;
    totalXp: number;
    timeInvested: string;
  };
  user: {
    level: number;
    levelProgress: number;
    xpNeeded: number;
    name: string;
    questsCreated: number;
    questsCompleted: number;
    successRate: number;
  }
}
```

### 2.3. Создание нового квеста
- **Endpoint:** `/api/quests`
- **Метод:** POST
- **Описание:** Создание нового квеста пользователем
- **Авторизация:** Bearer JWT-токен
- **Тело запроса:**
```typescript
{
  title: string;
  description?: string; // опционально
  content: Record<string, unknown>; // структурированные данные квеста
  is_public?: boolean; // опционально, по умолчанию false
}
```
- **Возвращаемые данные:**
```typescript
{
  id: string; // ID созданного квеста
  title: string;
  description: string;
  createdAt: string; // ISO-формат даты
}
```

### 2.4. Генерация квеста с помощью AI
- **Endpoint:** `/api/quests/generate`
- **Метод:** POST
- **Описание:** Генерация квеста с использованием OpenAI API
- **Авторизация:** Bearer JWT-токен
- **Тело запроса:**
```typescript
{
  theme: string; // тема квеста
  difficulty: 'easy' | 'medium' | 'hard'; // сложность
  additionalDetails?: string; // опционально, дополнительные пожелания
}
```
- **Возвращаемые данные:** Сгенерированный квест в формате, соответствующем интерфейсу `IGeneratedQuestData` (как в `GeneratedQuestDisplay`):
```typescript
{
  id: string;
  title: string;
  description: string;
  questType: string;
  difficulty: string;
  tasks: Array<{
    title: string;
    description: string;
  }>;
  rewards: {
    xp: number;
    itemName: string;
  }
}
```

### 2.5. Обновление прогресса квеста
- **Endpoint:** `/api/quests/{id}/progress`
- **Метод:** PATCH
- **Описание:** Обновление прогресса выполнения квеста
- **Параметры пути:**
  - `id`: ID квеста
- **Авторизация:** Bearer JWT-токен
- **Тело запроса:**
```typescript
{
  taskId: string; // ID завершенной задачи
  completed: boolean; // статус выполнения
  progress?: number; // опционально, прогресс выполнения задачи (0-100)
}
```
- **Возвращаемые данные:**
```typescript
{
  questProgress: number; // обновленный общий прогресс квеста (0-100)
  taskCompleted: boolean;
  xpEarned: number; // количество полученного опыта
}
```

### 2.6. Получение достижений квеста
- **Endpoint:** `/api/quests/{id}/achievements`
- **Метод:** GET
- **Описание:** Получение списка достижений для конкретного квеста
- **Параметры пути:**
  - `id`: ID квеста
- **Авторизация:** Bearer JWT-токен
- **Возвращаемые данные:**
```typescript
[
  {
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
  }
]
```

## 3. Сохранение и публикация квестов

### 3.1. Сохранение квеста
- **Endpoint:** `/api/quests/{id}/save`
- **Метод:** PUT
- **Описание:** Сохранение/обновление квеста
- **Параметры пути:**
  - `id`: ID квеста
- **Авторизация:** Bearer JWT-токен
- **Тело запроса:** Полная структура квеста или частичное обновление
- **Возвращаемые данные:**
```typescript
{
  id: string;
  updated: boolean;
  timestamp: string; // ISO-формат даты обновления
}
```

### 3.2. Публикация квеста
- **Endpoint:** `/api/quests/{id}/publish`
- **Метод:** POST
- **Описание:** Публикация квеста для доступа другим пользователям
- **Параметры пути:**
  - `id`: ID квеста
- **Авторизация:** Bearer JWT-токен
- **Тело запроса:**
```typescript
{
  isPublic: boolean; // статус публикации
}
```
- **Возвращаемые данные:**
```typescript
{
  id: string;
  isPublic: boolean;
  publishedAt: string; // ISO-формат даты публикации, если isPublic=true
}
```

## 4. Пользовательский прогресс

### 4.1. Получение статистики пользователя
- **Endpoint:** `/api/users/stats`
- **Метод:** GET
- **Описание:** Получение общей статистики пользователя
- **Авторизация:** Bearer JWT-токен
- **Возвращаемые данные:**
```typescript
{
  level: number;
  levelProgress: number;
  xpNeeded: number;
  name: string;
  questsCreated: number;
  questsCompleted: number;
  successRate: number;
}
```

### 4.2. Получение списка активных квестов пользователя
- **Endpoint:** `/api/users/quests/active`
- **Метод:** GET
- **Описание:** Получение списка активных (начатых) квестов пользователя
- **Авторизация:** Bearer JWT-токен
- **Возвращаемые данные:** Массив кратких данных о квестах с прогрессом

## 5. Интеграция с AI-сервисами

### 5.1. Генерация квеста с помощью OpenAI
- **Endpoint:** `/api/openai/generate-quest`
- **Метод:** POST
- **Описание:** Внутренний эндпоинт для генерации квеста с помощью OpenAI API
- **Параметры запроса:**
```typescript
{
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard';
  additionalDetails?: string;
}
```
- **Возвращаемые данные:** Структура сгенерированного квеста
- **Примечание:** Этот эндпоинт используется внутри `/api/quests/generate` для взаимодействия с OpenAI API

## 6. Комментарии к API-вызовам в коде

### 6.1. Получение списка квестов
```typescript
// Используется в хуке useQuests
// Path: /home/killen/Documents/questAI/apps/web/lib/hooks/useQuests.ts
const response = await fetch(`/api/quests?${params.toString()}`);
// Назначение: получение списка квестов пользователя или публичных квестов
```

### 6.2. Получение квеста по ID
```typescript
// Используется в хуке useQuest
// Path: /home/killen/Documents/questAI/apps/web/lib/hooks/useQuests.ts
const response = await fetch(`/api/quests/${id}`);
// Назначение: получение полных данных о конкретном квесте для отображения на странице детального просмотра
```

### 6.3. Создание нового квеста
```typescript
// Используется в хуке useCreateQuest
// Path: /home/killen/Documents/questAI/apps/web/lib/hooks/useQuests.ts
const response = await fetch('/api/quests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(questData)
});
// Назначение: создание нового квеста пользователем
```

### 6.4. Генерация квеста с помощью AI
```typescript
// Используется в хуке useGenerateQuest
// Path: /home/killen/Documents/questAI/apps/web/lib/hooks/useQuests.ts
const response = await fetch('/api/quests/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(params)
});
// Назначение: генерация нового квеста с помощью AI на основе параметров пользователя
```

## 7. Взаимодействие интерфейса с API

### 7.1. Страница создания квеста
- Компонент `CreateQuestPage` (Path: `/home/killen/Documents/questAI/apps/web/app/quests/create/page.tsx`)
- Взаимодействие: 
  - Вызывает функцию генерации квеста через хук `useGeneratedQuest`
  - При нажатии на кнопку "Сгенерировать квест" вызывает API `/api/quests/generate`
  - При сохранении должен вызывать API `/api/quests` с методом POST

### 7.2. Страница детального просмотра квеста
- Компонент `DetailedQuestPage` (Path: `/home/killen/Documents/questAI/apps/web/app/quest/[id]/page.tsx`)
- Взаимодействие:
  - При загрузке вызывает API `/api/quests/{id}` для получения данных квеста
  - Отображает компоненты с задачами, достижениями и наградами
  - Компоненты задач должны взаимодействовать с API `/api/quests/{id}/progress` при изменении статуса

### 7.3. Компоненты задач квеста
- Компонент `QuestTasks` отображает задачи квеста
- При изменении статуса задачи должен вызывать API `/api/quests/{id}/progress`
- Обновляет общий прогресс квеста на интерфейсе

## 8. Модель данных Supabase

На основе анализа frontend-части рекомендуется следующая структура таблиц в Supabase:

1. **profiles** - профили пользователей
   - `id`: UUID (связан с auth.users)
   - `name`: string
   - `level`: integer
   - `xp`: integer
   - `quests_created`: integer
   - `quests_completed`: integer

2. **quests** - основная информация о квестах
   - `id`: UUID (primary key)
   - `title`: string
   - `description`: text
   - `content`: jsonb (полная структура квеста)
   - `created_at`: timestamp
   - `updated_at`: timestamp
   - `user_id`: UUID (foreign key -> profiles.id)
   - `is_public`: boolean
   - `quest_type`: string

3. **quest_completions** - прогресс прохождения квестов
   - `id`: UUID (primary key)
   - `quest_id`: UUID (foreign key -> quests.id)
   - `user_id`: UUID (foreign key -> profiles.id)
   - `progress`: integer (0-100)
   - `started_at`: timestamp
   - `completed_at`: timestamp (null если не завершен)

4. **quest_tasks** - задачи квестов и их статус
   - `id`: UUID (primary key)
   - `quest_id`: UUID (foreign key -> quests.id)
   - `title`: string
   - `description`: text
   - `xp`: integer
   - `order`: integer (порядок отображения)

5. **user_task_progress** - прогресс пользователя по задачам
   - `id`: UUID (primary key)
   - `task_id`: UUID (foreign key -> quest_tasks.id)
   - `user_id`: UUID (foreign key -> profiles.id)
   - `completed`: boolean
   - `progress`: integer (0-100)
   - `completed_at`: timestamp

## 9. Заключение

Приведенное техническое описание охватывает все необходимые API-эндпоинты для полноценной работы frontend-части приложения QuestAI с backend. Реализация должна следовать принципам REST API с использованием JWT-аутентификации через Supabase и соблюдением Row Level Security (RLS) для безопасного доступа к данным.

Для всех API-запросов рекомендуется использовать статус-коды HTTP:
- 200 OK - успешный запрос
- 201 Created - успешное создание ресурса
- 400 Bad Request - некорректные данные в запросе
- 401 Unauthorized - отсутствие аутентификации
- 403 Forbidden - недостаточно прав
- 404 Not Found - ресурс не найден
- 500 Internal Server Error - внутренняя ошибка сервера
