# Переменные окружения для Railway API сервиса

Эти переменные окружения должны быть настроены в Railway для сервиса `questai-API`:

## Обязательные переменные

### Supabase
- `SUPABASE_URL` - URL вашего Supabase проекта (например: https://your-project.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key для Supabase (с полными правами доступа)
- `SUPABASE_JWT_SECRET` - JWT secret из настроек Supabase
- `SUPABASE_ANON_KEY` - Anon key для Supabase (публичный ключ)

### OpenAI
- `OPENAI_API_KEY` - API ключ для OpenAI

### Приложение
- `PORT` - Порт для API сервиса (Railway автоматически предоставляет эту переменную)
- `FRONTEND_URL` - URL фронтенда (например: https://questai-web.up.railway.app)

### Опциональные переменные (для rate limiting)
- `RATE_LIMIT_GLOBAL` - Максимум запросов в минуту на все эндпоинты (по умолчанию: 100)
- `RATE_LIMIT_QUEST_MINUTE` - Лимит генерации квестов в минуту (по умолчанию: 3)
- `RATE_LIMIT_QUEST_HOUR` - Лимит генерации квестов в час (по умолчанию: 20)

### Платежи (если используются)
- `CLOUDPAYMENTS_PUBLIC_ID` - Public ID для CloudPayments
- `CLOUDPAYMENTS_API_SECRET` - API Secret для CloudPayments

## Как настроить в Railway

1. Перейдите в настройки сервиса `questai-API` в Railway
2. Откройте вкладку "Variables"
3. Добавьте каждую переменную из списка выше
4. Railway автоматически перезапустит сервис после добавления переменных

## Важные замечания

- НЕ используйте файлы `.env` в продакшене
- Railway автоматически предоставляет переменную `PORT`
- Все переменные окружения должны быть настроены через интерфейс Railway
- После изменения переменных сервис автоматически перезапустится
