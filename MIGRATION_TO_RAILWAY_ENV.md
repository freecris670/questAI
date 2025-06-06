# Миграция на переменные окружения Railway

## Что было сделано

### 1. Обновлена конфигурация NestJS
- Удалена загрузка .env файлов из `ConfigModule`
- Теперь приложение использует только переменные окружения, предоставляемые Railway

### 2. Созданы конфигурационные файлы для Railway
- `apps/api/nixpacks.toml` - конфигурация Nixpacks для API сервиса
- `apps/api/railway.json` - конфигурация Railway для API сервиса
- `apps/api/RAILWAY_ENV_VARS.md` - документация по переменным окружения

### 3. Добавлен health check endpoint
- Путь: `/api/health`
- Возвращает статус и timestamp
- Используется Railway для проверки работоспособности сервиса

### 4. Создан скрипт для архивации .env файлов
- `archive-env-files.sh` - перемещает все .env файлы в архивную директорию
- Предотвращает случайное использование локальных переменных в продакшене

## Как деплоить на Railway

### Шаг 1: Архивация .env файлов (опционально)
```bash
./archive-env-files.sh
```

### Шаг 2: Push в репозиторий
```bash
git add .
git commit -m "Configure for Railway environment variables"
git push
```

### Шаг 3: Настройка переменных в Railway
1. Откройте сервис `questai-API` в Railway
2. Перейдите в раздел "Variables"
3. Добавьте все необходимые переменные:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `FRONTEND_URL`
   - И другие (см. `apps/api/RAILWAY_ENV_VARS.md`)

### Шаг 4: Деплой
Railway автоматически задеплоит приложение после push в репозиторий

## Проверка работоспособности

После деплоя проверьте:
1. Health endpoint: `https://questai-api.up.railway.app/api/health`
2. Основной endpoint: `https://questai-api.up.railway.app/api`
3. Логи в Railway для выявления возможных ошибок

## Важные замечания

1. **Не коммитьте .env файлы** - все секреты должны быть в Railway
2. **Railway предоставляет PORT автоматически** - не указывайте его явно
3. **Используйте внутренние URL для связи между сервисами**:
   - API: `questai-api.railway.internal`
   - Web: `questai-web.railway.internal`

## Откат изменений

Если нужно вернуться к использованию .env файлов:
1. Восстановите файлы из `.env-archive/`
2. Верните `envFilePath` в `ConfigModule.forRoot()`
3. Удалите или закомментируйте переменные в Railway
