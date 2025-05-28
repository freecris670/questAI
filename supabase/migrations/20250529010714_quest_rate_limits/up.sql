-- Создание таблицы для отслеживания частоты запросов к созданию квестов
CREATE TABLE IF NOT EXISTS quest_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Создаем индексы для эффективного поиска
CREATE INDEX IF NOT EXISTS quest_rate_limits_ip_idx ON quest_rate_limits (ip_address);
CREATE INDEX IF NOT EXISTS quest_rate_limits_created_at_idx ON quest_rate_limits (created_at);
CREATE INDEX IF NOT EXISTS quest_rate_limits_ip_created_at_idx ON quest_rate_limits (ip_address, created_at);

-- Добавляем RLS-политики (Row Level Security)
ALTER TABLE quest_rate_limits ENABLE ROW LEVEL SECURITY;

-- Политика для сервисного пользователя (через adminClient)
CREATE POLICY "Service account can do all" ON quest_rate_limits 
  FOR ALL 
  TO service_role 
  USING (true);

-- Комментарии к таблице
COMMENT ON TABLE quest_rate_limits IS 'Таблица для отслеживания частоты запросов создания квестов по IP';
COMMENT ON COLUMN quest_rate_limits.ip_address IS 'IP-адрес пользователя';
COMMENT ON COLUMN quest_rate_limits.created_at IS 'Время создания записи (время запроса)';

-- Функция для автоматического удаления старых записей (старше 3 дней)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM quest_rate_limits WHERE created_at < now() - INTERVAL '3 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
