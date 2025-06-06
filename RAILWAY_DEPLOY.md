# Деплой на Railway

Этот проект настроен для деплоя на Railway с использованием прямых команд сборки и запуска.

## 1. Подготовка проекта

### Структура проекта
questAI/
├── apps/
│   ├── api/         # NestJS API
│   └── web/         # Next.js web
├── packages/
│   └── ui/          # Shared UI components
├── package.json     # Root package с командами сборки
└── pnpm-workspace.yaml

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
SUPABASE_SERVICE_ROLE_KEY=your_SUPABASE_SERVICE_ROLE_KEY
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

### 3. Настройка деплоя без Dockerfile

#### API Service:

1. Подключите репозиторий к Railway
2. Установите Root Directory: `apps/api`
3. Build Command: `pnpm install && pnpm run build`
4. Start Command: `pnpm run start:prod`
5. Установите переменные окружения

#### Web Service:

1. Подключите тот же репозиторий
2. Установите Root Directory: `apps/web` 
3. Build Command: `pnpm install && pnpm run build`
4. Start Command: `pnpm run start:web`
5. Установите переменные окружения

## 4. Настройка доменов

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

## Логи и отладка

### Просмотр логов в Railway

В случае проблем с деплоем или работой приложения, проверьте логи в Railway Dashboard:

1. Перейдите в раздел сервиса (API или Web)
2. Нажмите на вкладку "Deployments"
3. Выберите последний деплоймент
4. Проверьте логи сборки и запуска

### Частые ошибки

1. **Ошибка сборки**: Убедитесь, что все зависимости корректно указаны в package.json
2. **Ошибка запуска**: Проверьте переменные окружения и команду start
3. **Ошибка 137**: Недостаточно памяти, попробуйте оптимизировать процесс сборки

## Мониторинг

Railway предоставляет встроенные инструменты мониторинга:
- Логи приложений
- Метрики производительности
- Использование ресурсов

## Troubleshooting

### Проблемы со сборкой
1. Проверьте логи сборки в Railway
2. Убедитесь, что все переменные окружения установлены
3. Проверьте правильность команд сборки и запуска

### Проблемы с подключением
1. Убедитесь, что API домен правильно указан в Web Service
2. Проверьте настройки CORS в API
3. Проверьте настройки Supabase

### Проблемы с производительностью
1. Мониторьте использование ресурсов
2. Рассмотрите увеличение лимитов ресурсов
3. Оптимизируйте запросы к базе данных
