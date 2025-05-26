-- Создание таблицы для отслеживания использования пробного доступа
CREATE TABLE IF NOT EXISTS trial_quests_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL UNIQUE,
  quests_created INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Комментарии к таблице и полям
COMMENT ON TABLE trial_quests_usage IS 'Отслеживание использования пробного доступа по IP-адресам';
COMMENT ON COLUMN trial_quests_usage.ip_address IS 'IP-адрес пользователя';
COMMENT ON COLUMN trial_quests_usage.quests_created IS 'Количество созданных квестов с этого IP-адреса';

-- Индекс для быстрого поиска по IP-адресу
CREATE INDEX idx_trial_quests_ip ON trial_quests_usage(ip_address);

-- Триггер для автоматического обновления поля updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trial_quests_usage_timestamp
BEFORE UPDATE ON trial_quests_usage
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Политика безопасности RLS - только сервис может читать и изменять данные
ALTER TABLE trial_quests_usage ENABLE ROW LEVEL SECURITY;

-- Создаем политику для сервисной роли
CREATE POLICY service_trial_quests_policy ON trial_quests_usage 
  USING (true)
  WITH CHECK (true);

-- Разрешаем доступ только аутентифицированному сервису
GRANT SELECT, INSERT, UPDATE, DELETE ON trial_quests_usage TO service_role;
