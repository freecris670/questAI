-- Создание таблицы для хранения пробных квестов
CREATE TABLE IF NOT EXISTS public.trial_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT NOT NULL, -- IP-адрес для идентификации неавторизованного пользователя
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  original_request TEXT -- Исходный запрос пользователя
);

-- Включение Row Level Security (RLS)
ALTER TABLE public.trial_quests ENABLE ROW LEVEL SECURITY;

-- Комментарии к таблице и полям
COMMENT ON TABLE public.trial_quests IS 'Хранение пробных квестов для неавторизованных пользователей';
COMMENT ON COLUMN public.trial_quests.ip_address IS 'IP-адрес пользователя для идентификации';
COMMENT ON COLUMN public.trial_quests.original_request IS 'Исходный запрос пользователя для генерации';

-- Индекс для быстрого поиска по IP-адресу
CREATE INDEX idx_trial_quests_ip_address ON public.trial_quests(ip_address);

-- Триггер для автоматического обновления поля updated_at
CREATE TRIGGER update_trial_quests_updated_at
BEFORE UPDATE ON public.trial_quests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Политики доступа для trial_quests
-- Разрешаем чтение по IP-адресу (для неавторизованных пользователей)
CREATE POLICY "Неавторизованные пользователи могут видеть свои пробные квесты" ON public.trial_quests
  FOR SELECT USING (true); -- Временно разрешаем всем, позже можно настроить более строгую политику

-- Разрешаем сервису обновлять данные
CREATE POLICY "Сервис может создавать и обновлять пробные квесты" ON public.trial_quests
  USING (true)
  WITH CHECK (true);

-- Выдаем необходимые разрешения сервисной роли
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trial_quests TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trial_quests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trial_quests TO authenticated;
