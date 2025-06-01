# Railway Quick Start Guide

⚠️ **ВАЖНО**: Перед деплоем установите переменные окружения в Railway Dashboard!

## 🚀 Быстрый деплой (5 минут)

### 1. Создайте проект в Railway
1. Зайдите на [railway.app](https://railway.app)
2. Создайте новый проект
3. Выберите "Deploy from GitHub repo"

### 2. Настройте API Service

1. **Создайте новый сервис для API:**
   - Name: `questai-api`
   - Root Directory: `apps/api`
   - Build Command: `pnpm install && pnpm run build`
   - Start Command: `pnpm run start:prod`

2. **Добавьте переменные окружения:**
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   PORT=3001
   NODE_ENV=production
   ```

### 3. Настройте Web Service

1. **Создайте новый сервис для Web:**
   - Name: `questai-web`
   - Root Directory: `apps/web`
   - Build Command: (оставьте пустым)
   - Start Command: (оставьте пустым)

2. **Добавьте переменные окружения:**
   ```env
   NEXT_PUBLIC_API_URL=https://questai-api-production-xxxx.railway.app
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NODE_ENV=production
   ```

3. **Настройте Dockerfile:**
   - Dockerfile Path: `apps/web/Dockerfile`

### Шаг 5: Получение доменов

1. После деплоя API скопируйте его домен
2. Обновите `NEXT_PUBLIC_API_URL` в Web Service
3. Перезапустите Web Service

### Шаг 6: Проверка

1. Откройте домен Web приложения
2. Проверьте работу API через `/api/docs`
3. Протестируйте создание квеста

## 🔧 Настройки проекта

### Структура файлов для Railway:
```
├── railway.toml              # Основная конфигурация
├── .dockerignore            # Исключения для Docker
├── apps/
│   ├── api/
│   │   └── Dockerfile       # Docker для API
│   └── web/
│       └── Dockerfile       # Docker для Web
└── .env.example             # Пример переменных окружения
```

### Порты:
- API: 3001
- Web: 3000

### Домены Railway:
- API: `https://questai-api-production-xxxx.railway.app`
- Web: `https://questai-web-production-xxxx.railway.app`

## 🐛 Troubleshooting

### Проблема: Ошибка сборки
**Решение:** Проверьте логи сборки в Railway Dashboard

### Проблема: API недоступен
**Решение:** 
1. Проверьте переменные окружения
2. Убедитесь, что порт 3001 экспонирован
3. Проверьте логи приложения

### Проблема: CORS ошибки
**Решение:** Убедитесь, что домен Web добавлен в CORS настройки API

### Проблема: 502 Bad Gateway
**Решение:** 
1. Проверьте, что приложение слушает правильный порт
2. Убедитесь, что переменная PORT установлена
3. Проверьте health check эндпоинт

## 📊 Мониторинг

Railway предоставляет:
- Логи в реальном времени
- Метрики CPU/RAM
- Сетевой трафик
- Время отклика

## 🔄 Автоматический деплой

Railway автоматически пересобирает приложение при пуше в основную ветку GitHub.
