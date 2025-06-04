# Настройка QuestAI на Railway

## Быстрый старт через Railway Dashboard

### 1. Создание сервисов в Railway Dashboard

1. Откройте проект: https://railway.com/project/89b176de-74e2-4c6c-8df6-08e4f4bd0683

2. Создайте два новых сервиса:
   - Нажмите "New Service" → "GitHub Repo" 
   - Выберите ваш репозиторий
   - Создайте первый сервис для API
   - Повторите для Web сервиса

### 2. Настройка API сервиса

В настройках сервиса API:

**Settings → General:**
- Service Name: `questai-api`

**Settings → Build:**
- Root Directory: `/apps/api`
- Dockerfile Path: `./Dockerfile`

**Settings → Deploy:**
- Start Command: оставить пустым (используется из Dockerfile)

**Variables:**
```
PORT=3001
NODE_ENV=production
SUPABASE_URL=<ваш_supabase_url>
SUPABASE_SERVICE_KEY=<ваш_service_key>
SUPABASE_JWT_SECRET=<ваш_jwt_secret>
OPENAI_API_KEY=<ваш_openai_key>
FRONTEND_URL=https://questai-web.up.railway.app
RATE_LIMIT_GLOBAL=100
RATE_LIMIT_QUEST_MINUTE=3
RATE_LIMIT_QUEST_HOUR=20
```

### 3. Настройка Web сервиса

В настройках сервиса Web:

**Settings → General:**
- Service Name: `questai-web`

**Settings → Build:**
- Root Directory: `/apps/web`
- Dockerfile Path: `./Dockerfile`

**Settings → Deploy:**
- Start Command: оставить пустым (используется из Dockerfile)

**Variables:**
```
PORT=3000
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://questai-api.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=<ваш_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ваш_anon_key>
```

### 4. Генерация доменов

Для каждого сервиса:
1. Перейдите в Settings → Networking
2. Нажмите "Generate Domain"
3. Запишите сгенерированные URL

### 5. Обновление переменных окружения

После генерации доменов, обновите:
- В API сервисе: `FRONTEND_URL` на реальный URL Web сервиса
- В Web сервисе: `NEXT_PUBLIC_API_URL` на реальный URL API сервиса

## Альтернативный метод через CLI

### Деплой API сервиса

```bash
cd apps/api
railway link 89b176de-74e2-4c6c-8df6-08e4f4bd0683
railway service
# Выберите или создайте сервис questai-api

# Установка переменных
railway variables set PORT=3001 NODE_ENV=production
# ... остальные переменные

# Деплой
railway up
```

### Деплой Web сервиса

```bash
cd apps/web
railway link 89b176de-74e2-4c6c-8df6-08e4f4bd0683
railway service
# Выберите или создайте сервис questai-web

# Установка переменных
railway variables set PORT=3000 NODE_ENV=production
# ... остальные переменные

# Деплой
railway up
```

## Проверка деплоя

```bash
# Логи API
railway logs --service questai-api

# Логи Web
railway logs --service questai-web

# Открыть сервисы
railway open
```

## Важные моменты

1. **Монорепозиторий**: Railway автоматически определит структуру через Dockerfile
2. **Переменные окружения**: Обязательно установите все переменные перед деплоем
3. **Домены**: Используйте сгенерированные Railway домены для CORS и API_URL
4. **Healthcheck**: API имеет endpoint `/api/health` для проверки

## Отладка

Если возникают проблемы:

1. Проверьте логи: `railway logs --service <service-name>`
2. Убедитесь, что все переменные окружения установлены
3. Проверьте, что Dockerfile корректно собирается локально
4. Убедитесь, что порты соответствуют переменной PORT
