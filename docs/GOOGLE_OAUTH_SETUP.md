# Настройка Google OAuth для QuestAI

## 1. Настройка Google Cloud Console

### Создание OAuth 2.0 Client ID

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект или создайте новый
3. Перейдите в **APIs & Services** > **Credentials**
4. Нажмите **Create Credentials** > **OAuth Client ID**
5. Выберите **Web application**

### Настройка Consent Screen

1. Перейдите в **APIs & Services** > **OAuth consent screen**
2. Выберите **External** (для тестирования)
3. Заполните обязательные поля:
   - App name: `QuestAI`
   - User support email: ваш email
   - Developer contact information: ваш email
4. В разделе **Authorized domains** добавьте:
   - `tauhdotxuvkwpesdigxa.supabase.co` (домен Supabase)
   - `questai-web.onrender.com` (продакшн домен)
5. В разделе **Scopes** добавьте:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

### Настройка OAuth Client

1. **Application type**: Web application
2. **Authorized JavaScript origins**:
   - `http://localhost:10000` (локальная разработка)
   - `http://localhost:3000` (альтернативный порт)
   - `https://questai-web.onrender.com` (продакшн)
   - `https://tauhdotxuvkwpesdigxa.supabase.co` (Supabase)

3. **Authorized redirect URIs**:
   - `http://localhost:10000/auth/callback`
   - `http://localhost:3000/auth/callback`
   - `https://questai-web.onrender.com/auth/callback`
   - `https://tauhdotxuvkwpesdigxa.supabase.co/auth/v1/callback`

## 2. Настройка Supabase

### В Supabase Dashboard

1. Перейдите в ваш проект Supabase
2. Откройте **Authentication** > **Providers**
3. Найдите **Google** и включите его
4. Введите:
   - **Client ID**: ваш Google OAuth Client ID
   - **Client Secret**: ваш Google OAuth Client Secret

### Redirect URLs в Supabase

Убедитесь, что в настройках аутентификации добавлены URL для редиректа:
- `http://localhost:10000/auth/callback`
- `http://localhost:3000/auth/callback`
- `https://questai-web.onrender.com/auth/callback`

## 3. Переменные окружения

### Для локальной разработки (.env.local)

```bash
# Фронтенд
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_SUPABASE_URL=https://tauhdotxuvkwpesdigxa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-google-client-id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-google-client-secret
```

### Для продакшн (Render)

В настройках Environment Variables на Render добавьте:

**Для фронтенда:**
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Для API:**
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`

## 4. Тестирование

### Локально

1. Запустите API: `cd apps/api && npm run start:dev`
2. Запустите фронтенд: `cd apps/web && npm run dev`
3. Откройте `http://localhost:10000/auth`
4. Нажмите кнопку "Google" для тестирования

### В продакшн

1. Деплойте изменения на Render
2. Откройте `https://questai-web.onrender.com/auth`
3. Тестируйте Google OAuth

## 5. Отладка

### Частые проблемы

1. **Ошибка "redirect_uri_mismatch"**:
   - Проверьте, что все redirect URI добавлены в Google Console
   - Убедитесь, что URL точно совпадают (включая протокол и порт)

2. **Ошибка "invalid_client"**:
   - Проверьте правильность Client ID и Secret
   - Убедитесь, что переменные окружения установлены корректно

3. **Кнопка Google не отображается**:
   - Проверьте, что `NEXT_PUBLIC_GOOGLE_CLIENT_ID` установлен
   - Проверьте консоль браузера на ошибки JavaScript

### Логи для отладки

Проверьте логи в:
- Консоли браузера (F12)
- Логах Supabase (Dashboard > Logs)
- Логах Render (Dashboard > Logs)
