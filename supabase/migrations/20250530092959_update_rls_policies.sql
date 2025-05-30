-- Обновление RLS-политик для хранения квестов неавторизованных пользователей

-- 1. Создаем таблицу для анонимных квестов, если она еще не существует
DO $$
BEGIN
  -- Создаем таблицу для анонимных квестов, если она еще не существует
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'anonymous_quests') THEN
    CREATE TABLE public.anonymous_quests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      content JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      ip_address TEXT NOT NULL,
      session_id TEXT,
      quest_type TEXT,
      is_public BOOLEAN NOT NULL DEFAULT false
    );

    -- Индекс для быстрого поиска по IP-адресу
    CREATE INDEX idx_anonymous_quests_ip ON public.anonymous_quests(ip_address);
    
    -- Триггер для автоматического обновления поля updated_at
    CREATE TRIGGER update_anonymous_quests_timestamp
    BEFORE UPDATE ON public.anonymous_quests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    
    -- Включение Row Level Security (RLS)
    ALTER TABLE public.anonymous_quests ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Создаем таблицу для задач анонимных квестов, если еще не существует
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'anonymous_quest_tasks') THEN
    CREATE TABLE public.anonymous_quest_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      quest_id UUID NOT NULL REFERENCES public.anonymous_quests(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      xp INTEGER NOT NULL DEFAULT 10,
      order_num INTEGER NOT NULL
    );
    
    -- Включение Row Level Security (RLS)
    ALTER TABLE public.anonymous_quest_tasks ENABLE ROW LEVEL SECURITY;
  END IF;
END;
$$;

-- 2. Создаем или заменяем функцию для проверки лимита квестов
CREATE OR REPLACE FUNCTION check_anonymous_quests_limit(ip text)
RETURNS BOOLEAN AS $$
DECLARE
  quest_count INTEGER;
  max_quests INTEGER := 5; -- Лимит квестов на IP адрес
BEGIN
  SELECT COUNT(*) INTO quest_count FROM public.anonymous_quests WHERE ip_address = ip;
  RETURN quest_count < max_quests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Создаем или заменяем функцию для обновления статистики использования
CREATE OR REPLACE FUNCTION update_trial_usage_for_anonymous_quest()
RETURNS TRIGGER AS $$
BEGIN
  -- Атомарное обновление использования пробных квестов
  INSERT INTO public.trial_quests_usage (ip_address, quests_created, first_quest_at, last_quest_at)
  VALUES (
    NEW.ip_address, 
    1, 
    now(), 
    now()
  )
  ON CONFLICT (ip_address) 
  DO UPDATE SET 
    quests_created = public.trial_quests_usage.quests_created + 1,
    last_quest_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Создаем триггер для автоматического обновления статистики
DO $$
BEGIN
  -- Удаляем старый триггер, если он существует
  DROP TRIGGER IF EXISTS anonymous_quest_created ON public.anonymous_quests;
  
  -- Создаем новый триггер
  CREATE TRIGGER anonymous_quest_created
  AFTER INSERT ON public.anonymous_quests
  FOR EACH ROW
  EXECUTE FUNCTION update_trial_usage_for_anonymous_quest();
END;
$$;

-- 5. Создаем политики доступа для анонимных квестов
DO $$
BEGIN
  -- Удаляем старые политики, если они существуют
  DROP POLICY IF EXISTS "Любой может создать квест в рамках лимита" ON public.anonymous_quests;
  DROP POLICY IF EXISTS "Пользователи могут видеть свои квесты" ON public.anonymous_quests;
  DROP POLICY IF EXISTS "Сервисная роль имеет полный доступ" ON public.anonymous_quests;
  
  -- Создаем новые политики
  CREATE POLICY "Любой может создать квест в рамках лимита" ON public.anonymous_quests
    FOR INSERT WITH CHECK (check_anonymous_quests_limit(ip_address));
  
  CREATE POLICY "Пользователи могут видеть свои квесты" ON public.anonymous_quests
    FOR SELECT USING (true);
  
  CREATE POLICY "Сервисная роль имеет полный доступ" ON public.anonymous_quests
    USING (current_setting('role') = 'service_role')
    WITH CHECK (current_setting('role') = 'service_role');
  
  -- Удаляем старые политики для задач
  DROP POLICY IF EXISTS "Пользователи могут видеть задачи своих квестов" ON public.anonymous_quest_tasks;
  DROP POLICY IF EXISTS "Сервисная роль имеет полный доступ к задачам" ON public.anonymous_quest_tasks;
  
  -- Создаем новые политики для задач
  CREATE POLICY "Пользователи могут видеть задачи своих квестов" ON public.anonymous_quest_tasks
    FOR SELECT USING (true);
  
  CREATE POLICY "Сервисная роль имеет полный доступ к задачам" ON public.anonymous_quest_tasks
    USING (current_setting('role') = 'service_role')
    WITH CHECK (current_setting('role') = 'service_role');
END;
$$;

-- 6. Предоставляем необходимые права доступа
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anonymous_quests TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anonymous_quest_tasks TO anon, authenticated, service_role;

-- 7. Модифицируем политику для таблицы quests, чтобы разрешить анонимный доступ
DO $$
BEGIN
  -- Проверяем существование таблицы quests перед модификацией политик
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quests') THEN
    -- Сбрасываем счетчики для всех IP-адресов для тестирования
    UPDATE public.trial_quests_usage SET quests_created = 0;
  END IF;
END;
$$;