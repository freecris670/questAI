# Настройка QuestAI на Railway

## Структура проекта

Проект использует монорепозиторий с тремя сервисами:
- **API сервис** (NestJS) - `questai-API`
- **Web сервис** (Next.js) - `questai-WEB`
- **UI пакет** (Shared components) - `packages/ui`

## Важно: Сборка UI пакета

Проект использует общий UI пакет `@questai/ui`, который должен быть собран перед сборкой основных сервисов. Это автоматически настроено в конфигурационных файлах.

## Конфигурация сервисов в Railway

### API сервис (questai-API)

#### Настройки сборки
- **Builder**: Nixpacks
- **Root Directory**: `/`
- **Build Command**: Автоматически из `nixpacks.toml`
- **Start Command**: Автоматически из `nixpacks.toml`

#### Переменные окружения
Добавьте следующие переменные в настройках сервиса:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Приложение
FRONTEND_URL=https://questai-web.up.railway.app

# Rate Limiting (опционально)
RATE_LIMIT_GLOBAL=100
RATE_LIMIT_QUEST_MINUTE=3
RATE_LIMIT_QUEST_HOUR=20
```

#### Внутренние и внешние URL
- **Внутренний URL**: `questai-api.railway.internal`
- **Внешний URL**: `questai-api.up.railway.app`

### Web сервис (questai-WEB)

#### Настройки сборки
- **Builder**: Nixpacks
- **Root Directory**: `/`
- **Build Command**: `cd /app/apps/web && pnpm run build`
- **Start Command**: `cd /app/apps/web && pnpm run start`

#### Переменные окружения
```bash
# API URL
NEXT_PUBLIC_API_URL=https://questai-api.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Для внутренней связи (SSR)
API_URL_INTERNAL=http://questai-api.railway.internal:3001
```

## Важные замечания

1. **Не используйте файлы .env** - все переменные окружения должны быть настроены через интерфейс Railway
2. **Railway автоматически предоставляет переменную PORT** - не нужно её указывать явно
3. **Монорепозиторий** - оба сервиса используют общий репозиторий, но разные директории для сборки
4. **Nixpacks** - используется вместо Docker для более быстрой сборки
5. **Health checks** - API сервис имеет endpoint `/api/health` для проверки состояния

## Команды для локальной разработки

```bash
# Установка зависимостей
pnpm install

# Запуск обоих сервисов
pnpm dev

# Запуск только API
pnpm run dev --filter=@questai/api

# Запуск только Web
pnpm run dev --filter=@questai/web

# Сборка для продакшена
pnpm run build
```

## Структура файлов конфигурации

```
questAI/
├── nixpacks.toml              # Базовая конфигурация Nixpacks
├── apps/
│   ├── api/
│   │   ├── nixpacks.toml      # Конфигурация Nixpacks для API
│   │   ├── railway.json       # Конфигурация Railway для API
│   │   └── RAILWAY_ENV_VARS.md # Документация переменных окружения
│   └── web/
│       ├── nixpacks.toml      # Конфигурация Nixpacks для Web
│       └── railway.json       # Конфигурация Railway для Web
```
