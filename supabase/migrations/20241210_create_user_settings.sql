-- Создание таблицы настроек пользователя
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Профиль пользователя
  avatar TEXT,
  username TEXT,
  email TEXT,
  bio TEXT,
  
  -- Предпочтения
  quest_style TEXT DEFAULT 'fantasy' CHECK (quest_style IN ('fantasy', 'scifi', 'realism', 'mystery', 'adventure')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language TEXT DEFAULT 'ru' CHECK (language IN ('ru', 'en')),
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  
  -- Интеграции
  calendar_integration BOOLEAN DEFAULT false,
  task_manager_integration BOOLEAN DEFAULT false,
  notifications_integration BOOLEAN DEFAULT true,
  
  -- Уведомления
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  quest_reminders BOOLEAN DEFAULT true,
  quest_completions BOOLEAN DEFAULT true,
  new_achievements BOOLEAN DEFAULT true,
  reminders BOOLEAN DEFAULT true,
  notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('immediately', 'daily', 'weekly')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- Настройка RLS (Row Level Security)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свои настройки
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Политика: пользователи могут создавать свои настройки
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут обновлять свои настройки
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Политика: пользователи могут удалять свои настройки
CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Создание функции для получения или создания настроек пользователя
CREATE OR REPLACE FUNCTION get_or_create_user_settings(user_uuid UUID)
RETURNS user_settings AS $$
DECLARE
  settings user_settings;
BEGIN
  -- Попытка найти существующие настройки
  SELECT * INTO settings FROM user_settings WHERE user_id = user_uuid;
  
  -- Если настройки не найдены, создаем новые с значениями по умолчанию
  IF NOT FOUND THEN
    INSERT INTO user_settings (user_id) VALUES (user_uuid) RETURNING * INTO settings;
  END IF;
  
  RETURN settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
