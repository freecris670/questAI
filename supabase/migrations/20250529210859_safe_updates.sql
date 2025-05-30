-- Безопасная миграция, которая проверяет существование объектов перед их созданием

-- Добавление столбцов first_quest_at и last_quest_at в таблицу trial_quests_usage
-- Если они еще не существуют
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'trial_quests_usage') THEN
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'trial_quests_usage' 
                 AND column_name = 'first_quest_at') THEN
      ALTER TABLE trial_quests_usage ADD COLUMN first_quest_at TIMESTAMPTZ DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'trial_quests_usage' 
                 AND column_name = 'last_quest_at') THEN
      ALTER TABLE trial_quests_usage ADD COLUMN last_quest_at TIMESTAMPTZ DEFAULT now();
    END IF;
  END IF;
END;
$$;

-- Создание функции upsert_trial_usage для атомарного обновления
CREATE OR REPLACE FUNCTION upsert_trial_usage(p_ip_address TEXT, p_last_quest_at TIMESTAMPTZ)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
  new_count INTEGER;
BEGIN
  -- Попытка обновить существующую запись
  UPDATE trial_quests_usage
  SET 
    quests_created = quests_created + 1,
    last_quest_at = p_last_quest_at
  WHERE ip_address = p_ip_address
  RETURNING quests_created INTO new_count;
  
  -- Если записи не существует, создаем новую
  IF new_count IS NULL THEN
    INSERT INTO trial_quests_usage (
      ip_address, 
      quests_created, 
      first_quest_at, 
      last_quest_at
    ) 
    VALUES (
      p_ip_address, 
      1, 
      p_last_quest_at, 
      p_last_quest_at
    )
    RETURNING quests_created INTO new_count;
  END IF;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создание таблицы quest_rate_limits если она еще не существует
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' 
                 AND table_name = 'quest_rate_limits') THEN
    
    CREATE TABLE quest_rate_limits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ip_address TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    
    -- Создаем индексы для эффективного поиска
    CREATE INDEX quest_rate_limits_ip_idx ON quest_rate_limits (ip_address);
    CREATE INDEX quest_rate_limits_created_at_idx ON quest_rate_limits (created_at);
    CREATE INDEX quest_rate_limits_ip_created_at_idx ON quest_rate_limits (ip_address, created_at);
    
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
  END IF;
END;
$$;

-- Создание функции cleanup_old_rate_limits с улучшенной безопасностью
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits() RETURNS void AS $$
BEGIN
  -- Удаляем записи старше 3 дней
  DELETE FROM quest_rate_limits 
  WHERE created_at < now() - INTERVAL '3 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Сброс лимитов для всех IP-адресов при переходе на новый лимит 5 квестов
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'trial_quests_usage') THEN
    UPDATE trial_quests_usage SET quests_created = 0;
    
    -- Обновляем комментарий к таблице
    COMMENT ON TABLE trial_quests_usage IS 'Таблица для отслеживания использования пробных квестов. Лимит: 5 квестов на IP адрес';
  END IF;
END;
$$;