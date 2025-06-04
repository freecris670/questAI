# Деплой QuestAI на Railway через CLI

## Предварительные требования

1. Установлен Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Авторизация в Railway:
   ```bash
   railway login
   ```

## Структура проекта для Railway

Проект настроен как монорепозиторий с двумя сервисами:
- **API** (NestJS) - `apps/api`
- **Web** (Next.js) - `apps/web`

## Шаг 1: Создание проекта в Railway

```bash
# В корневой директории проекта
railway init
```

Выберите имя проекта: `questai`

## Шаг 2: Создание сервисов

### Создание API сервиса

```bash
# Создаем новый сервис для API
railway service create questai-api

# Привязываем директорию к сервису
cd apps/api
railway link questai-api
cd ../..
```

### Создание Web сервиса

```bash
# Создаем новый сервис для Web
railway service create questai-web

# Привязываем директорию к сервису
cd apps/web
railway link questai-web
cd ../..
```

## Шаг 3: Настройка переменных окружения

### Для API сервиса

```bash
railway variables set \
  PORT=3001 \
  NODE_ENV=production \
  SUPABASE_URL="your_supabase_url" \
  SUPABASE_SERVICE_KEY="your_supabase_service_key" \
  SUPABASE_JWT_SECRET="your_supabase_jwt_secret" \
  OPENAI_API_KEY="your_openai_api_key" \
  FRONTEND_URL="https://questai-web.up.railway.app" \
  RATE_LIMIT_GLOBAL=100 \
  RATE_LIMIT_QUEST_MINUTE=3 \
  RATE_LIMIT_QUEST_HOUR=20 \
  -s questai-api
```

### Для Web сервиса

```bash
railway variables set \
  PORT=3000 \
  NODE_ENV=production \
  NEXT_PUBLIC_API_URL="https://questai-api.up.railway.app" \
  NEXT_PUBLIC_SUPABASE_URL="your_supabase_url" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key" \
  -s questai-web
```

## Шаг 4: Деплой сервисов

### Деплой API

```bash
cd apps/api
railway up --service questai-api
cd ../..
```

### Деплой Web

```bash
cd apps/web
railway up --service questai-web
cd ../..
```

## Шаг 5: Проверка деплоя

```bash
# Проверить статус сервисов
railway status

# Открыть логи API
railway logs -s questai-api

# Открыть логи Web
railway logs -s questai-web

# Открыть сервисы в браузере
railway open -s questai-api
railway open -s questai-web
```

## Альтернативный метод: Использование скрипта

Можно использовать готовый скрипт для автоматизации:

```bash
./deploy-railway.sh
```

## Настройка доменов

После успешного деплоя:

1. Перейдите в Railway Dashboard
2. Выберите сервис `questai-web`
3. В разделе Settings → Domains добавьте кастомный домен
4. Обновите DNS записи вашего домена

## Отладка

### Проверка сборки локально

```bash
# Проверка Docker сборки API
cd apps/api
docker build -t questai-api .
docker run -p 3001:3001 questai-api

# Проверка Docker сборки Web
cd apps/web
docker build -t questai-web .
docker run -p 3000:3000 questai-web
```

### Частые проблемы

1. **Ошибка с переменными окружения**
   - Убедитесь, что все переменные установлены через `railway variables`
   - Проверьте правильность имен переменных

2. **Ошибка сборки**
   - Проверьте Dockerfile на корректность путей
   - Убедитесь, что `pnpm-lock.yaml` закоммичен

3. **Ошибка с портами**
   - Railway автоматически присваивает порт через переменную PORT
   - Убедитесь, что приложение слушает на `0.0.0.0:$PORT`

## Мониторинг

```bash
# Просмотр метрик
railway metrics -s questai-api
railway metrics -s questai-web

# Постоянный мониторинг логов
railway logs -s questai-api --tail
railway logs -s questai-web --tail
```
