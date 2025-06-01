# Деплой на Railway

Этот проект настроен для деплоя на Railway с использованием Docker контейнеров.

## Структура проекта

- `apps/api/` - NestJS API сервер
- `apps/web/` - Next.js фронтенд приложение

## Подготовка к деплою

### 1. Создание проектов на Railway

1. Зайдите на [railway.app](https://railway.app) и создайте новый проект
2. Создайте два сервиса:
   - **API Service** - для бэкенда
   - **Web Service** - для фронтенда

### 2. Настройка переменных окружения

#### Для API Service:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
PORT=3001
NODE_ENV=production
```

#### Для Web Service:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
```

### 3. Настройка деплоя

**⚠️ ВАЖНО: Railway автоматически находит Dockerfile**

Railway ищет Dockerfile в следующем порядке:
1. В Root Directory (если указан)
2. В корне репозитория

#### Способ 1: Используя Root Directory (рекомендуется - самый простой)
Этот способ использует оптимизированные Dockerfile в папках приложений.

**API Service:**
1. Подключите репозиторий к Railway
2. Root Directory: `apps/api`
3. Railway автоматически найдет `apps/api/Dockerfile`

**Web Service:**
1. Подключите тот же репозиторий
2. Root Directory: `apps/web`
3. Railway автоматически найдет `apps/web/Dockerfile`

✅ **Преимущества**: 
- Простая настройка
- Dockerfile уже оптимизированы для раздельной сборки
- Не нужно переименовывать файлы

#### Способ 2: Использование railway.toml (для продвинутых пользователей)
Для использования оптимизированных Dockerfile из корня:

**Для API Service:**
```bash
# Переименуйте railway.api.toml в railway.toml
cp railway.api.toml railway.toml
git add railway.toml
git commit -m "Configure API service"
git push
```

**Для Web Service (в отдельной ветке):**
```bash
git checkout -b web-service
cp railway.web.toml railway.toml
git add railway.toml
git commit -m "Configure Web service"
git push
```

Затем в Railway настройте каждый сервис на свою ветку.

### 4. Настройка доменов

1. После деплоя API получите домен (например: `https://api-production-xxxx.railway.app`)
2. Обновите переменную `NEXT_PUBLIC_API_URL` в Web Service на полученный домен API
3. Перезапустите Web Service

## Локальная разработка

```bash
# Установка зависимостей
pnpm install

# Запуск в режиме разработки
pnpm run dev

# Сборка проекта
pnpm run build:all

# Запуск API
pnpm run start:api

# Запуск Web
pnpm run start:web
```

## Структура Docker

### API Dockerfile
- Использует Node.js 18 Alpine
- Устанавливает pnpm
- Собирает NestJS приложение
- Экспонирует порт 3001

### Web Dockerfile
- Многоэтапная сборка для оптимизации
- Использует Next.js standalone режим
- Экспонирует порт 3000
- Оптимизирован для продакшена

## Мониторинг

Railway предоставляет встроенные инструменты мониторинга:
- Логи приложений
- Метрики производительности
- Использование ресурсов

## Troubleshooting

### Проблемы со сборкой
1. Проверьте логи сборки в Railway
2. Убедитесь, что все переменные окружения установлены
3. Проверьте правильность путей к Dockerfile

### Проблемы с подключением
1. Убедитесь, что API домен правильно указан в Web Service
2. Проверьте настройки CORS в API
3. Проверьте настройки Supabase

### Проблемы с производительностью
1. Мониторьте использование ресурсов
2. Рассмотрите увеличение лимитов ресурсов
3. Оптимизируйте запросы к базе данных
