-- Создание таблицы для отслеживания использования пробных квестов
CREATE TABLE IF NOT EXISTS trial_quests_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL UNIQUE,
  quests_created INTEGER DEFAULT 0 NOT NULL,
  first_quest_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_quest_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для быстрого поиска по IP-адресу
CREATE INDEX idx_trial_quests_ip ON trial_quests_usage(ip_address);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_trial_quests_usage_updated_at 
  BEFORE UPDATE ON trial_quests_usage 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
