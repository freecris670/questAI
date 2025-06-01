# Деплой QuestAI на Railway

## Подготовка проекта

Проект готов к деплою на Railway с использованием турборепо команд (без Docker).

### Исправленные проблемы:

1. ✅ **Исправлены импорты в supabase.service.ts**:
   - Добавлены отсутствующие импорты `Injectable`, `OnModuleInit`, `UnauthorizedException`
   - Добавлено логирование для диагностики проблем с переменными окружения

2. ✅ **Обновлены переменные окружения**:
   - Используется `SUPABASE_SERVICE_KEY` (как запрошено)
   - Добавлена `SUPABASE_JWT_SECRET` в .env.example файлы

3. ✅ **Настроены команды турборепо**:
   - `build:api`: `turbo run build --filter=@questai/api`
   - `start:api`: `turbo run start --filter=@questai/api`

4. ✅ **Обновлен railway.toml**:
   - Настроены правильные команды сборки и запуска
   - Установлены базовые переменные окружения

## Настройка переменных окружения в Railway

### Для API сервиса установите следующие переменные:

**Обязательные:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
```

**Дополнительные:**
```bash
PORT=3001
NODE_ENV=production
SUPABASE_ANON_KEY=your-anon-key
```

## Инструкция по деплою

### 1. Создание проекта в Railway

1. Зайдите на [railway.app](https://railway.app)
2. Нажмите "New Project"
3. Выберите "Deploy from GitHub repo"
4. Выберите ваш репозиторий QuestAI

### 2. Настройка сервиса API

1. В Railway Dashboard откройте ваш проект
2. Нажмите на сервис (если он один) или создайте новый
3. Перейдите в Settings
4. В разделе "Environment" добавьте все переменные окружения (см. выше)
5. В разделе "Deploy" убедитесь, что:
   - Builder: Nixpacks
   - Build Command: `pnpm run build:api`
   - Start Command: `pnpm run start:api`

### 3. Деплой

1. Нажмите "Deploy" или сделайте push в репозиторий
2. Railway автоматически соберет и запустит ваше приложение
3. В логах вы должны увидеть успешный запуск API на порту 3001

### 4. Проверка

После успешного деплоя:
- API будет доступен по адресу: `https://your-service-name.railway.app`
- Проверьте логи на наличие ошибок
- Убедитесь, что все переменные окружения установлены корректно

## Устранение неисправностей

### Ошибка "Отсутствуют необходимые переменные окружения для Supabase"

Если вы видите эту ошибку, проверьте:

1. **Переменные установлены в Railway**:
   - Перейдите в Settings → Environment
   - Убедитесь, что установлены `SUPABASE_URL` и `SUPABASE_SERVICE_KEY`

2. **Правильные имена переменных**:
   - Используйте именно `SUPABASE_SERVICE_KEY` (не `SUPABASE_SERVICE_ROLE_KEY`)
   - Все переменные должны точно соответствовать именам в коде

3. **Значения переменных**:
   - URL должен быть в формате: `https://your-project.supabase.co`
   - Service Key должен начинаться с `eyJ...`

### Логи для диагностики

В коде добавлено логирование, которое покажет:
```
Отсутствуют необходимые переменные окружения для Supabase
SUPABASE_URL: установлен/отсутствует
SUPABASE_SERVICE_KEY: установлен/отсутствует
```

Это поможет точно определить, какая переменная отсутствует.

## Структура проекта для Railway

```
questAI/
├── railway.toml          # Конфигурация Railway
├── .env.example          # Пример переменных окружения
├── turbo.json           # Конфигурация Turbo
├── package.json         # Корневые скрипты
├── apps/
│   └── api/
│       ├── package.json # API скрипты
│       └── src/
│           └── supabase/
│               └── supabase.service.ts  # Исправленный сервис
└── packages/
    └── ui/              # Общие UI компоненты
```

## Следующие шаги

После успешного деплоя API:
1. Настройте Web сервис (отдельно)
2. Обновите CORS настройки в API для Railway доменов
3. Протестируйте API эндпоинты
4. Настройте домен (опционально)
